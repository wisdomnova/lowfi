"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      addToast({
        message: "Error",
        description: "Invalid or missing reset link. Please request a new one.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      addToast({
        message: "Error",
        description: "Password must be at least 8 characters long",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        message: "Error",
        description: "Passwords do not match",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          message: "Error",
          description: data.error || "Failed to reset password",
          type: "error",
        });
      } else {
        setSuccess(true);
        addToast({
          message: "Success",
          description: "Password updated successfully",
          type: "success",
        });
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }
    } catch (err) {
      addToast({
        message: "Error",
        description: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight">
              Password Updated
            </h1>
            <p className="text-[#6B7280]">
              Your password has been reset successfully. Redirecting to sign in...
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer transition-transform hover:rotate-3">
          <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center text-white">
            <div className="w-4 h-4 bg-white rounded-[2px]" />
          </div>
          <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">
            LowFi
          </span>
        </Link>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[#1F2937] tracking-tight">
            Set New Password
          </h2>
          <p className="text-[#6B7280]">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] px-1">
              New Password
            </label>
            <div className="flex items-center gap-3 px-4 bg-white border-2 border-[#E5E7EB] rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group">
              <Lock className="w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#1F2937] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex-1 bg-transparent border-none p-0 text-[#1F2937] text-sm font-medium focus:ring-0 focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] px-1">
              Confirm Password
            </label>
            <div className="flex items-center gap-3 px-4 bg-white border-2 border-[#E5E7EB] rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group">
              <Lock className="w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#1F2937] transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="flex-1 bg-transparent border-none p-0 text-[#1F2937] text-sm font-medium focus:ring-0 focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#1F2937] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
