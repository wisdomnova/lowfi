"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-[#1F2937] py-32 px-6 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold mb-8 uppercase tracking-[0.2em]">
            Start Today
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            Stop working weekends. <br />
            <span className="text-white/40 italic">Start</span> using LowFi.
          </h2>

          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join hundreds of business owners who finally have their time back. 
            Setting up takes less than 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
                className="h-14 px-12 bg-white text-[#1F2937] rounded-full font-bold text-base hover:bg-gray-100 transition-all shadow-2xl shadow-white/5"
                onClick={() => window.location.href = '/auth/signup'}
            >
              Get Started
            </button>
            <button 
                className="h-14 px-12 border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/5 transition-all"
                onClick={() => {}}
            >
              Contact Sales
            </button>
          </div>

          <div className="mt-16 flex justify-center gap-12 text-white/20">
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold text-white/40 tracking-tighter">99.9%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Accuracy</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold text-white/40 tracking-tighter">24/7</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Always On</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold text-white/40 tracking-tighter">Secure</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
