'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, DashboardSkeleton } from '@/components/Skeleton';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import { PaymentSecurityModal } from '@/components/modals/PaymentSecurityModal';
import { PLANS, getPlanPrice, getMonthlyEquivalent } from '@/lib/plans';
import { Check, AlertCircle, Calendar } from 'lucide-react';
import type { PlanType, BillingCycle } from '@/lib/plans';

interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: string;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const addToast = useToast((state) => state.addToast);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscriptions/current');

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
          setIsYearly(data.billingCycle === 'yearly');
        } else {
          throw new Error('Failed to fetch subscription');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        addToast({
          type: 'error',
          message: 'Failed to load subscription data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, addToast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-10 animate-pulse">
           <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8 mb-10">
              <div className="space-y-4">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-12 w-40 rounded-2xl" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-48 rounded-[2rem]" count={1} />
              <Skeleton className="h-48 rounded-[2rem]" count={1} />
              <Skeleton className="h-48 rounded-[2rem]" count={1} />
              <Skeleton className="h-48 rounded-[2rem]" count={1} />
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <Skeleton className="h-[600px] rounded-[3rem]" count={1} />
              <Skeleton className="h-[600px] rounded-[3rem]" count={1} />
              <Skeleton className="h-[600px] rounded-[3rem]" count={1} />
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Page Header */}
        <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">
              Billing & Plans
            </h1>
            <p className="text-[#1F2937]/50 font-medium mt-1">
              Manage your subscription and billing information.
            </p>
          </div>
          <a 
            href="https://billing.stripe.com/customer/signin/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-6 border-2 border-[#1F2937] rounded-2xl flex items-center justify-center text-xs font-bold text-[#1F2937] bg-white shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer uppercase tracking-widest"
          >
            Download Invoices
          </a>
        </div>

        {/* Current Plan Card */}
        {subscription && (
          <div className="bg-white rounded-[2rem] border border-[#1F2937]/5 p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
               <span className="px-4 py-1.5 rounded-full bg-[#1F2937] text-white text-[10px] font-bold uppercase tracking-widest">
                  Active Subscription
               </span>
            </div>
            
            <div className="grid md:grid-cols-4 gap-12 relative z-10">
              <div className="md:col-span-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/40 mb-4">Current Plan</p>
                <h3 className="text-3xl font-bold text-[#1F2937] mb-2">
                  {PLANS[subscription.plan].name}
                </h3>
                <p className="text-[#1F2937]/60 font-medium">
                  Renewing on <span className="text-[#1F2937] font-bold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/40 mb-4">Current Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#1F2937]">
                    ${getPlanPrice(subscription.plan, subscription.billingCycle)}
                  </span>
                  <span className="text-[#1F2937]/30 text-xs font-bold uppercase tracking-widest">/{subscription.billingCycle === 'yearly' ? 'Year' : 'Month'}</span>
                </div>
              </div>

              <div className="flex items-center">
                <a 
                  href="https://billing.stripe.com/customer/signin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-full bg-[#1F2937] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all cursor-pointer inline-flex items-center justify-center"
                >
                  Manage in Stripe
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Cycle Toggle */}
        <div className="flex items-center justify-center gap-8 py-4">
          <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${!isYearly ? 'text-[#1F2937]' : 'text-[#1F2937]/30'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1F2937]/10 transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[#1F2937] transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isYearly ? 'text-[#1F2937]' : 'text-[#1F2937]/30'}`}>Yearly <span className="text-emerald-600 ml-1">Save 20%</span></span>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col p-8 rounded-[2rem] border transition-all duration-300 ${
                subscription?.plan === plan.id 
                ? 'border-[#1F2937] bg-white ring-4 ring-[#1F2937]/5' 
                : 'border-[#1F2937]/5 bg-[#1F2937]/[0.02] hover:bg-white hover:border-[#1F2937]/20'
              }`}
            >
              <div className="mb-8">
                <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-[0.2em] mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-[#1F2937] tracking-tight">
                    ${isYearly ? Math.floor(getPlanPrice(plan.id, 'yearly') / 12) : getPlanPrice(plan.id, 'monthly')}
                  </span>
                  <span className="text-[#1F2937]/30 text-[10px] font-bold uppercase tracking-widest">/ Month</span>
                </div>
                <p className="text-[#1F2937]/50 text-xs font-medium leading-relaxed h-10">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {[
                  `${plan.features.tools === 'unlimited' ? 'Unlimited' : plan.features.tools} Active Tools`,
                  `${plan.features.documentsPerMonth === Number.MAX_SAFE_INTEGER ? 'Unlimited' : plan.features.documentsPerMonth} Docs / Month`,
                  `${plan.features.teamMembers === Number.MAX_SAFE_INTEGER ? 'Unlimited' : plan.features.teamMembers} Team Members`,
                  `${plan.features.support.charAt(0).toUpperCase() + plan.features.support.slice(1)} Support`,
                  plan.features.apiAccess ? 'Full API Access' : 'No API Access',
                ].map((feature, fIndex) => (
                  <div key={fIndex} className="flex gap-3 items-center text-[12px] text-[#1F2937]/70 font-medium">
                    <div className="w-1 h-1 rounded-full bg-[#1F2937]/20" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {subscription?.plan === plan.id ? (
                <div className="h-12 w-full flex items-center justify-center bg-[#1F2937]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ring-1 ring-inset ring-[#1F2937]/10">
                  Current Plan
                </div>
              ) : (
                <CheckoutButton plan={plan.id} billingCycle={isYearly ? 'yearly' : 'monthly'} />
              )}
            </div>
          ))}
        </div>

        {/* Security / Compliance */}
        <div className="flex justify-between items-center bg-[#1F2937] text-white p-6 rounded-[1.5rem] mt-8">
            <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white/60" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">Payment Security</h4>
                    <p className="text-white/40 text-xs">All payments are securely processed through Stripe.</p>
                 </div>
            </div>
            <button 
              onClick={() => setIsSecurityModalOpen(true)}
              className="px-6 py-2 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
        </div>

        <PaymentSecurityModal 
          isOpen={isSecurityModalOpen} 
          onClose={() => setIsSecurityModalOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
