"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2937]/5 border border-[#1F2937]/10 text-[#1F2937]/60 text-xs font-bold mb-8 uppercase tracking-[0.2em]">
              The simple way to work
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-[#1F2937] mb-8 leading-[0.95] tracking-tight">
              The boring work, <br />
              <span className="text-[#1F2937]/30 italic">done for you.</span>
            </h1>

            <p className="text-xl text-[#1F2937]/60 mb-12 max-w-xl leading-relaxed font-medium">
              Stop chasing invoices and answering the same customer emails every day. 
              LowFi handles the paperwork and follow-ups so you can focus on what actually makes you money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button 
                onClick={() => window.location.href = '/auth/signup'}
                className="h-14 px-10 bg-[#1F2937] text-white rounded-full font-bold text-base hover:bg-black transition-all duration-300 shadow-xl shadow-[#1F2937]/10 cursor-pointer"
              >
                Get Started
              </button>
              <button 
                className="h-14 px-10 border-2 border-[#1F2937]/10 text-[#1F2937] rounded-full font-bold text-base hover:bg-[#1F2937]/5 transition-all duration-300 cursor-pointer"
              >
                See How It Works
              </button>
            </div>

            <div className="mt-16 flex items-center gap-8 grayscale opacity-40">
              <div className="text-xs font-bold uppercase tracking-widest text-[#1F2937]/40 mb-2 block">Used by hundreds of small businesses</div>
              {/* Add placeholder logos or icons here if needed */}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-20 bg-[#1F2937]/5 blur-[120px] rounded-full -z-10" />
            <div className="bg-[#1F2937] rounded-[2rem] p-3 shadow-2xl relative overflow-hidden group">
              <div className="bg-white rounded-[1.5rem] overflow-hidden border border-[#1F2937]/10 aspect-[4/3] relative">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-[#1F2937]/5 pb-6">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-[#1F2937] rounded" />
                      <div className="h-3 w-48 bg-[#1F2937]/20 rounded" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[#1F2937]/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-[#1F2937]/10 space-y-4">
                      <div className="h-3 w-20 bg-[#1F2937]/30 rounded" />
                      <div className="h-8 w-12 bg-[#1F2937] rounded" />
                    </div>
                    <div className="p-6 rounded-2xl bg-[#1F2937] space-y-4">
                      <div className="h-3 w-20 bg-white/40 rounded" />
                      <div className="h-8 w-12 bg-white rounded" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="h-2 w-full bg-[#1F2937]/5 rounded" />
                    <div className="h-2 w-full bg-[#1F2937]/5 rounded" />
                    <div className="h-2 w-3/4 bg-[#1F2937]/5 rounded" />
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute bottom-4 right-4 h-32 w-48 bg-[#FAFAF8] rounded-xl border border-[#1F2937]/10 translate-y-8 translate-x-8 shadow-xl group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
