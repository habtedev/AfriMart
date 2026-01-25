"use client";

import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

// If using shadcn, import these components (assuming they're installed)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include", // Ensure session cookie is set
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }
      if (data.user) {
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/admin/orders";
        }, 1200);
      } else {
        throw new Error("Login failed. No user info received");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md">
        {/* Logo and Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 mb-4">
            <span className="text-2xl font-bold text-white">AM</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            AfriMart Admin
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to manage your store dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-500">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          
          <CardContent>

            {error && (
              <div 
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div 
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>{success}</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@afrimart.com"
                          type="email"
                          disabled={loading}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={loading}
                            className="h-11 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end">
                  <Link
                    href="/admin/login/reset-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer"
                    prefetch={false}
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <Separator className="my-2" />
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              <p>Having trouble signing in?</p>
              <p className="mt-1">
                Contact{" "}
                <a
                  href="mailto:support@afrimart.com"
                  className="font-medium text-blue-600 hover:underline"
                >
                  support@afrimart.com
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            This is a secure admin portal. All activities are monitored and logged.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}