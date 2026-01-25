"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

export default function AdminSetNewPasswordPage() {

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
    setValid(!!t && !!e);
    if (!t || !e) {
      setError("Invalid or expired reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    setPasswordStrength(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token || !email) {
      setError("Invalid or expired reset link. Please request a new password reset.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/admin/login");
        }, 1500);
      } else {
        setError(data.message || "Failed to update password. The reset link may be invalid or expired. Please request a new password reset.");
      }
    } catch (err) {
      setError("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  if (!valid) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>The password reset link is invalid or missing required information.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Set New Admin Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Progress value={passwordStrength * 20} className="mt-2" />
              <ul className="text-xs text-zinc-500 mt-1 space-y-0.5">
                <li className={password.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• One uppercase letter</li>
                <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>• One lowercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>• One number</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : ""}>• One special character</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <span className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Updating..." : "Set New Password"}
              </span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-xs text-zinc-500">
          <span>After resetting, you will be redirected to the login page.</span>
        </CardFooter>
      </Card>
    </main>
  );
}
