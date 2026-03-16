"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useToast } from "@/lib/toast";

function SignInContent() {
  const addToast = useToast((state) => state.addToast);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      addToast({
        message: "Email Verification",
        description: decodeURIComponent(msg),
        type: "info",
        duration: 6000
      });
    }
  }, [searchParams, addToast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      addToast({
        message: "Missing Credentials",
        description: "Please enter both your email and password.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          message: "Sign In Failed",
          description: data.error || "Invalid credentials",
          type: "error",
        });
        setLoading(false);
        return;
      }

      addToast({
        message: "Welcome back",
        description: "Signed in successfully. Redirecting...",
        type: "success",
      });
      router.push("/dashboard");
    } catch (err) {
      addToast({
        message: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
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
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 cursor-pointer transition-transform hover:rotate-3 group">
               <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-lowfi-white rounded-[2px]" />
              </div>
              <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">LowFi</span>
            </Link>
            <h1 className="text-3xl font-bold text-lowfi-slate-dark mb-2">Welcome back</h1>
            <p className="text-lowfi-slate-gray">Enter your credentials to access your operations dashboard.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-12"
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-lowfi-slate-dark underline underline-offset-4">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-lowfi-slate-gray hover:text-lowfi-slate-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-12"
              />
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-full h-12 font-bold uppercase tracking-widest text-xs"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-sm text-center text-lowfi-slate-gray">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-lowfi-slate-dark font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration/Marketing */}
      <div className="hidden lg:flex bg-lowfi-slate-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-lowfi-teal opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-12 inline-flex p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-20 rounded-lg bg-white/10 animate-pulse" />
              <div className="w-32 h-20 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Run your business <br />without the busywork.</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            "LowFi has cut our invoice processing time by over 80%. It's like having an extra team member who never sleeps."
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lowfi-gray-light/20" />
            <div className="text-left">
              <p className="text-white font-bold text-sm">Marcus Chen</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">COO at Arrive Logistics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
