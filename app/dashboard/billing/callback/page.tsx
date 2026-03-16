'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, AlertCircle, Shield, ArrowRight, Loader } from 'lucide-react';
import Link from 'next/link';

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    // Auto-redirect after 5 seconds if successful
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard/billing');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#4ADE80] blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 rounded-[2rem] bg-[#4ADE80] border-4 border-[#1F2937] flex items-center justify-center shadow-[8px_8px_0px_0px_#1F2937]">
                <Check className="w-12 h-12 text-[#1F2937]" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">
              Payment Confirmed
            </h1>
            <p className="text-[#1F2937]/60 font-medium leading-relaxed max-w-sm mx-auto">
              Your subscription is now active. You can access all features.
            </p>
          </div>

          <div className="pt-6">
            <Link href="/dashboard/billing">
              <Button className="w-full h-14 text-lg gap-2 cursor-pointer">
                View Billing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="mt-8 flex items-center justify-center gap-2 text-[#1F2937]/40">
              <Loader className="w-3 h-3 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono italic">
                Redirecting in 5 seconds...
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-12 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-[2rem] bg-red-400 border-4 border-[#1F2937] flex items-center justify-center shadow-[8px_8px_0px_0px_#1F2937]">
              <AlertCircle className="w-12 h-12 text-[#1F2937]" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">
              Checkout Cancelled
            </h1>
            <p className="text-[#1F2937]/60 font-medium leading-relaxed max-w-sm mx-auto">
              Your checkout was cancelled. No charges were made.
            </p>
          </div>

          <div className="pt-6">
            <Link href="/dashboard/billing">
              <Button variant="secondary" className="w-full h-14 text-lg cursor-pointer">
                Back to Billing
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-[#1F2937]/10 border-t-[#1F2937] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">Verifying Signal...</p>
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-[#1F2937]/10 border-t-[#1F2937] rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">Initializing Thread...</p>
          </div>
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
