"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 29 * 12 * 0.8, // 20% yearly discount
    description: "Everything you need to get going",
    features: [
      "3 core tools included",
      "200 documents/month",
      "Email support",
      "3 team members",
      "Simple reports",
      "Paperwork scanner",
    ],
    highlighted: false,
    cta: "Get Started"
  },
  {
    name: "Professional",
    monthlyPrice: 79,
    yearlyPrice: 79 * 12 * 0.8, // 20% yearly discount
    description: "For teams that need more power",
    features: [
      "All tools, unlimited",
      "2,000 documents/month",
      "10 team members",
      "Priority support",
      "Connect your apps",
      "Detailed reports",
      "Smarter work rules",
    ],
    highlighted: true,
    cta: "Get Started"
  },
  {
    name: "Enterprise",
    monthlyPrice: 199,
    yearlyPrice: 199 * 12 * 0.8, // 20% yearly discount
    description: "Unlimited power for large teams",
    features: [
      "Everything in Professional",
      "Unlimited documents",
      "Unlimited team members",
      "Dedicated support team",
      "Guaranteed service",
      "Direct data access",
      "We build what you need",
    ],
    highlighted: false,
    cta: "Get Started"
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section id="pricing" className="bg-[#FAFAF8] py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-[#1F2937]/20" />
            <span className="text-[#1F2937]/50 uppercase tracking-[0.2em] text-xs font-semibold">
              Plans
            </span>
            <div className="w-12 h-[1px] bg-[#1F2937]/20" />
          </div>
          <h2 className="text-5xl font-bold text-[#1F2937] mb-8 tracking-tight">
            Simple <span className="text-[#1F2937]/30 italic">Pricing.</span>
          </h2>
          <p className="text-[#1F2937]/60 max-w-xl mx-auto mb-16 text-lg font-medium">
            Straightforward plans that grow with your business. 
            Pick the one that fits your team.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-[10px] font-bold tracking-widest uppercase ${!isYearly ? 'text-[#1F2937]' : 'text-[#1F2937]/30'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1F2937]/10 transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#1F2937] transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isYearly ? 'text-[#1F2937]' : 'text-[#1F2937]/30'}`}>Yearly</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative flex flex-col p-10 rounded-[2.5rem] border ${plan.highlighted ? 'border-[#1F2937] bg-white shadow-2xl scale-105 z-10' : 'border-[#1F2937]/5 bg-[#1F2937]/[0.02] shadow-sm'} transition-all duration-500`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1F2937] text-white text-[9px] font-bold px-5 py-2 rounded-full uppercase tracking-widest">
                  Popular
                </div>
              )}
              <div className="mb-10">
                <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-[0.2em] mb-6">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-[#1F2937] tracking-tighter">
                    ${isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                  </span>
                  <span className="text-[#1F2937]/30 font-bold text-xs uppercase tracking-widest">/ Month</span>
                </div>
                {isYearly && (
                  <p className="text-[10px] text-[#1F2937]/40 font-bold uppercase tracking-[0.1em] mt-2">Billed annually (${Math.floor(plan.yearlyPrice)}/yr)</p>
                )}
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex gap-4 items-center text-[13px] text-[#1F2937]/70 font-medium">
                    <div className="w-1 h-1 rounded-full bg-[#1F2937]/20" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full h-14 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${plan.highlighted ? 'bg-[#1F2937] text-white hover:bg-black shadow-xl shadow-[#1F2937]/10' : 'border border-[#1F2937]/10 text-[#1F2937] hover:bg-[#1F2937]/5'}`}
                onClick={() => window.location.href = '/auth/signup'}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
