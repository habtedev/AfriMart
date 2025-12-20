"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Validate form on input change
  useEffect(() => {
    const isValid = email.trim() !== "" && password.trim() !== "";
    setFormValid(isValid);
  }, [email, password]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle enter key for password visibility toggle
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValid || loading) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ 
          email: email.trim(),
          password: password.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Store token with validation
      if (data.token && typeof data.token === 'string') {
        try {
          localStorage.setItem("token", data.token);
        } catch (storageError) {
          console.error("LocalStorage error:", storageError);
          // Continue anyway - server-side auth might still work
        }
      }

      // Update auth context with user info (customize as needed)
      if (data.user) {
        login(data.user);
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to intended page or default
      const next = searchParams?.get("next") || "/";
      router.replace(next);
      
    } catch (err: any) {
      // Provide more specific error messages
      const message = err.message || "Login failed. Please try again.";
      setError(message);
      
      // Clear password field on error
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // Handle demo login for testing
  const handleDemoLogin = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-950 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-8 shadow-lg shadow-zinc-200/20 dark:shadow-zinc-900/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div 
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-describedby={error ? "error-message" : undefined}
                disabled={loading}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  aria-describedby={error ? "error-message" : undefined}
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onKeyDown={(e) => handleKeyDown(e, () => setShowPassword(!showPassword))}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formValid || loading}
              aria-busy={loading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 py-3.5 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-zinc-400 disabled:to-zinc-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99]"
            >
              <span className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                {loading ? "Signing in..." : "Sign in"}
              </span>
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
            <span className="px-4 text-xs text-zinc-500 dark:text-zinc-400">OR</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
          </div>

          {/* Footer Links */}
          <div className="space-y-4 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
            
            {/* Terms & Privacy */}
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
            🔒 Your security is important to us. We use industry-standard encryption to protect your data.
          </p>
        </div>
      </div>
    </main>
  );
}