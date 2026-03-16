'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/lib/auth-context';
import { CreditCard, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface CheckoutButtonProps {
  plan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  disabled?: boolean;
}

export function CheckoutButton({
  plan,
  billingCycle,
  disabled = false,
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!user) {
      setError('Please sign in to continue');
      return;
    }

    if (!publishableKey) {
      setError('Stripe is not configured. Contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?cancelled=true`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error('Payment gateway error');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Payment system error');
      }

      // Redirect to hosted checkout page
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment error';
      setError(message.toUpperCase());
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckout}
        disabled={disabled || loading || !user}
        className={`w-full h-12 flex items-center justify-center gap-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all relative overflow-hidden group shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
          loading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200 shadow-none' 
            : 'bg-[#1F2937] text-white'
        }`}
      >
        <div className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Upgrade Plan</span>
            </>
          )}
        </div>
      </button>


      {error && (
        <div className="flex items-start gap-3 p-5 bg-red-50 border-2 border-red-100 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 block mb-1 underline decoration-red-200 underline-offset-4">Error</span>
            <p className="text-[10px] font-bold text-red-800 tracking-tight leading-relaxed font-mono">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && user && (
        <div className="flex items-center justify-center gap-2 opacity-40">
           <ShieldCheck className="w-3 h-3 text-slate-400" />
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure Payment</span>
        </div>
      )}
    </div>
  );
}
