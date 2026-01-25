"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Shadcn components (if installed)
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
});

export default function AdminResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Debug: Log mount
  React.useEffect(() => {
    console.log("[DEBUG] ResetPasswordPage mounted");
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    console.log("[DEBUG] handleSubmit called", values);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      console.log("[DEBUG] fetch response", res);
      const data = await res.json();
      console.log("[DEBUG] response data", data);
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || data.message || "Failed to send reset link. Please try again.");
        console.log("[DEBUG] Error after fetch", data.error || data.message);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.log("[DEBUG] Network error", err);
    } finally {
      setLoading(false);
      console.log("[DEBUG] Loading set to false");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/admin/login"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Admin Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="font-medium">Reset link sent!</p>
                  <p className="mt-1 text-sm">
                    Please check your email for the password reset link.<br />
                    <span className="font-semibold">The link will expire in 10 minutes.</span><br />
                    You must use the link in your email to reset your password.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="admin@afrimart.com"
                                type="email"
                                disabled={loading}
                                className="pl-10 h-11"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              <p>Didn't receive the email? Check your spam folder or</p>
              <Button
                variant="link"
                className="text-blue-600"
                onClick={() => {
                  if (form.getValues("email")) {
                    form.handleSubmit(handleSubmit)();
                  }
                }}
              >
                resend the link
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
