"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
// ...existing code...
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');

  // Password strength validation state
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    setPasswordValidation({
      isValid,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });
  }, [newPassword]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset OTP");
      setMessage("If your email exists, an OTP code has been sent.");
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP
  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired OTP");
      setMessage("OTP verified. Please enter your new password.");
      setStep('password');
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => window.location.href = "/auth/login", 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email address to receive a password reset OTP code.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 mb-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 mb-4">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={handleValidateOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">OTP Code</label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter the OTP sent to your email"
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="h-11"
                  disabled={loading}
                />
                {/* Password strength feedback */}
                <ul className="text-xs mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                  <li className={passwordValidation.hasMinLength ? "text-green-600" : ""}>• At least 8 characters</li>
                  <li className={passwordValidation.hasUppercase ? "text-green-600" : ""}>• Uppercase letter</li>
                  <li className={passwordValidation.hasLowercase ? "text-green-600" : ""}>• Lowercase letter</li>
                  <li className={passwordValidation.hasNumber ? "text-green-600" : ""}>• Number</li>
                  <li className={passwordValidation.hasSpecialChar ? "text-green-600" : ""}>• Special character</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !passwordValidation.isValid}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col items-center text-xs text-zinc-500">
          <span>If your email is registered, you will receive a reset OTP code shortly.</span>
        </CardFooter>
      </Card>
    </main>
  );
}
