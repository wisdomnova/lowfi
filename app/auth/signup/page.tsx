"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useToast } from "@/lib/toast";

export default function SignUp() {
  const addToast = useToast((state) => state.addToast);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!email || !password || !confirmPassword || !companyName) {
      addToast({
        message: "Missing Information",
        description: "Please fill in all fields to create your account.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        message: "Password Mismatch",
        description: "Your passwords do not match. Please check and try again.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      addToast({
        message: "Weak Password",
        description: "Password must be at least 6 characters long.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          message: "Creation Failed",
          description: data.error || "Could not create account",
          type: "error",
        });
        setLoading(false);
        return;
      }

      addToast({
        message: "Account Created",
        description: "Welcome to LowFi! Redirecting to your dashboard...",
        type: "success",
      });
      router.push("/dashboard");
    } catch (err) {
      addToast({
        message: "Unexpected Error",
        description: "An unexpected error occurred during signup.",
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
               <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center text-white">
                <div className="w-4 h-4 bg-white rounded-[2px]" />
              </div>
              <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">LowFi</span>
            </Link>
            <h1 className="text-3xl font-bold text-lowfi-slate-dark mb-2 leading-tight">Create your account</h1>
            <p className="text-lowfi-slate-gray">Get started in just a few minutes.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              label="Company Name"
              type="text"
              placeholder="Your company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
              className="h-12"
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-12"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-12"
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="h-12"
            />

            <Button 
              variant="primary" 
              type="submit" 
              className="w-full h-12 font-bold uppercase tracking-widest text-xs mt-4"
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-sm text-center text-lowfi-slate-gray">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-lowfi-slate-dark font-bold hover:underline">
              Log in
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
