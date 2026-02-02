"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Logo from "@/components/Layout/Header2/BrandLogo/Logo";
import api from "@/app/lib/api";
import Link from "next/link";

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // const email = searchParams.get("email") || ""; // passed from signup
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // resend cooldown
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pending_user_email");
    if (!storedEmail) {
      router.push("/signin");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  // Countdown for resend
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d$/.test(value) && value !== "") return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6 - index);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && index + i < 6; i++) {
      newOtp[index + i] = pasted[i];
    }
    setOtp(newOtp);

    // Focus last filled or last box
    const nextFocus = Math.min(index + pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

    
  // ===== VERIFY OTP =====
  const verifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpString }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess("Email verified successfully. Redirecting...");
        setTimeout(() => {
          router.push("/auth/setup-password");
        }, 1200);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

       setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess("OTP resent to your email");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };


  

  // Update signup handler to redirect here on success
  // In your SignUp component → after successful signup:
  // toast.success("OTP sent! Check your email.");
  // router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
    //   <div className="w-full max-w-md">
        <>
        <div className="mb-10 text-center">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-dark dark:text-white">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          We sent a 6-digit code to <strong>{email || "your email"}</strong>
        </p>
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form >
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={(e) => handlePaste(e, idx)}
                className="w-12 h-12 text-center text-2xl font-bold rounded-lg border border-black/10 dark:border-white/20 bg-transparent focus:border-primary focus:ring-0 outline-none transition dark:text-white"
                autoComplete="one-time-code" // Helps iOS suggest OTP from SMS/email
              />
            ))}
          </div>

          <button
            type="button"
            disabled={loading || otp.join("").length !== 6}
            onClick={verifyOtp}
            className="w-full py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-darkprimary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {timer > 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              Resend code in <span className="font-medium">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-primary hover:underline font-medium disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Back to{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      {/* </div>
    </div> */}
        
        </>
  );
}