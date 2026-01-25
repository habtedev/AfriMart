"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  // Password strength calculation
  useEffect(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    setPasswordStrength(score);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }
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
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Your Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {/* OTP Field */}
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">OTP Code</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter the OTP sent to your email"
              required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* Success Alert */}
          {message && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Password Strength Meter */}
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength <= 2
                    ? 'bg-red-400 w-1/4'
                    : passwordStrength === 3
                    ? 'bg-yellow-400 w-2/4'
                    : passwordStrength === 4
                    ? 'bg-blue-400 w-3/4'
                    : 'bg-green-500 w-full'
                }`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
            <ul className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 space-y-0.5">
              <li className={newPassword.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
              <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>• One uppercase letter</li>
              <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>• One lowercase letter</li>
              <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>• One number</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-600" : ""}>• One special character</li>
            </ul>
          </div>
          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 py-3.5 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-zinc-400 disabled:to-zinc-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99]"
          >
            <span className="flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Resetting..." : "Reset Password"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
