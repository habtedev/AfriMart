"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  Loader2, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTP_EXPIRY_MINUTES = 30;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(OTP_EXPIRY_MINUTES * 60);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // Initialize from URL params
  useEffect(() => {
    if (!searchParams) return;
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setStatus("idle");
      startCountdown();
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email.");
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiry <= 0 || status !== "idle") return;
    
    const timer = setInterval(() => {
      setOtpExpiry(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [otpExpiry, status]);

  const startCountdown = () => {
    setOtpExpiry(OTP_EXPIRY_MINUTES * 60);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  // Removed token verification logic. Only OTP flow is supported.

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    if (otpExpiry <= 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      toast.error("Too many attempts. Please request a new OTP.");
      return;
    }
    
    setStatus("loading");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-OTP-Attempt": attempts.toString()
        },
        body: JSON.stringify({ 
          email, 
          otp,
          timestamp: new Date().toISOString()
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        toast.success("Email verified successfully!");
        setTimeout(() => {
          router.push("/auth/login?verified=1");
        }, 2000);
      } else {
        setAttempts(prev => prev + 1);
        
        if (data.error?.includes("expired")) {
          toast.error("OTP has expired. Please request a new one.");
          setOtpExpiry(0);
        } else if (attempts + 1 >= MAX_ATTEMPTS) {
          toast.error("Too many failed attempts. OTP has been invalidated.");
          setOtpExpiry(0);
        } else {
          toast.error(data.error || "Invalid verification code");
        }
        
        setOtp("");
        setStatus("idle");
      }
    } catch (error) {
      setStatus("error");
      toast.error("Network error. Please try again.");
      setOtp("");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }
    
    setStatus("loading");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          type: "otp"
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("New verification code sent!");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setOtpExpiry(OTP_EXPIRY_MINUTES * 60);
        setAttempts(0);
        setOtp("");
        setStatus("idle");
      } else {
        toast.error(data.error || "Failed to resend verification email");
        setStatus("idle");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setStatus("idle");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.push("/auth/signup");
  };

  if (status === "verifying") {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <CardTitle>Verifying your email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Secure Verification
            </Badge>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <CardTitle className="text-2xl text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            {email && (
              <p className="text-sm">
                We sent a verification code to{" "}
                <span className="font-medium text-primary">{email}</span>
              </p>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Alerts */}
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your email has been verified successfully. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}
          
          {status === "error" && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Verification Error</AlertTitle>
              <AlertDescription>
                {message || "An error occurred during verification."}
              </AlertDescription>
            </Alert>
          )}
          
          {otpExpiry <= 0 && (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Code Expired</AlertTitle>
              <AlertDescription>
                Your verification code has expired. Please request a new one.
              </AlertDescription>
            </Alert>
          )}
          
          {attempts > 0 && (
            <Alert variant="warning">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining.
                Too many failed attempts will invalidate the code.
              </AlertDescription>
            </Alert>
          )}
          
          {/* OTP Input */}
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Enter the 6-digit verification code
              </Label>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={status === "loading" || otpExpiry <= 0}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Type the code sent to your email
              </p>
            </div>
            
            {/* Timer & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Code expires in:</span>
                </div>
                <span className={otpExpiry < 60 ? "text-destructive font-medium" : ""}>
                  {formatTime(otpExpiry)}
                </span>
              </div>
              
              <Progress 
                value={(otpExpiry / (OTP_EXPIRY_MINUTES * 60)) * 100} 
                className="h-1"
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={otp.length !== 6 || status === "loading" || otpExpiry <= 0}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>
          
          <Separator />
          
          {/* Resend Section */}
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Didn't receive the code?
            </p>
            
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleResend}
              disabled={resendCooldown > 0 || status === "loading"}
            >
              {resendCooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  Resend in {formatTime(resendCooldown)}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend Verification Code
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Check your spam folder if you don't see the email
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <div className="text-xs text-muted-foreground text-center">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Secure verification process
            </p>
            <p>Code valid for {OTP_EXPIRY_MINUTES} minutes only</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push(`/auth/login?email=${encodeURIComponent(email)}`)}
          >
            Already verified? Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}