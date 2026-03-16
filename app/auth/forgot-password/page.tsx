"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/toast";

export default function ForgotPassword() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!email) {
      addToast({
        message: "Error",
        description: "Please enter your email address",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        addToast({
          message: "Error",
          description: "Something went wrong. Please try again.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setMessage("Check your email for the password reset link");
      addToast({
        message: "Success",
        description: "Password reset link sent to your email",
        type: "success",
      });
    } catch (err) {
      addToast({
        message: "Error",
        description: "An unexpected error occurred",
        type: "error",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column: Form */}
      <div className="flex items-center justify-center p-8 bg-lowfi-cream">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 cursor-pointer transition-transform hover:rotate-3 group">
            <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center text-white">
              <div className="w-4 h-4 bg-white rounded-[2px]" />
            </div>
            <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">LowFi</span>
          </Link>

          <div className="mb-10">
            <Link href="/auth/signin" className="inline-flex items-center gap-2 text-lowfi-slate-gray hover:text-lowfi-slate-dark transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold">Back to login</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-lowfi-slate-dark mb-2">Reset password</h1>
            <p className="text-lowfi-slate-gray">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          {message ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-green-900 font-bold mb-2">Check your inbox</h3>
              <p className="text-green-700 text-sm mb-6">{message}</p>
              <Button 
                variant="secondary" 
                className="w-full bg-white border border-green-200 text-green-700"
                onClick={() => router.push("/auth/signin")}
              >
                Return to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-12"
              />

              <Button 
                variant="primary" 
                type="submit" 
                className="w-full h-12 font-bold uppercase tracking-widest text-xs"
                isLoading={loading}
              >
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-8 text-sm text-center text-lowfi-slate-gray">
            Still need help?{" "}
            <Link href="mailto:support@lowfi.com" className="text-lowfi-slate-dark font-bold hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration/Marketing (Matching Sign In/Sign Up) */}
      <div className="hidden lg:flex bg-lowfi-slate-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-lowfi-teal opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-12 inline-flex p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-20 rounded-lg bg-white/10 animate-pulse" />
              <div className="w-32 h-20 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Your account is <br />safe with us.</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            "Your data security is our priority. Reset your password and get back to your dashboard in no time."
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lowfi-gray-light/20" />
            <div className="text-left">
              <p className="text-white font-bold text-sm">Security Team</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">LowFi Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
