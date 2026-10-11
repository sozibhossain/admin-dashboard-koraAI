"use client";
import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { authApi } from "@/lib/api";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyResetOtp({ email, otp: otpCode });
      toast.success("OTP verified!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Check your email" description={<>Enter the 6-digit verification code sent to<span className="auth-email">{email || "your admin email"}</span></>}>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-otp" role="group" aria-label="Verification code">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1} of 6`}
              autoComplete={i === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>

        <Button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify OTP"}
        </Button>
      </form>

      <Link href="/forgot-password" className="auth-back">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
    </AuthCard>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="auth-loading" role="status">Loading...</div>}>
      <OTPForm />
    </Suspense>
  );
}
