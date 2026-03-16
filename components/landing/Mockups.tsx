"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

export function Mockups() {
  const steps = [
    {
      step: "01",
      title: "Add Your Information",
      description: "Link your paperwork and emails. It only takes a minute to get everything set up and ready to go."
    },
    {
      step: "02",
      title: "The System Does the Rest",
      description: "LowFi reads your documents, finds any mistakes, and handles the boring tasks for you automatically."
    },
    {
      step: "03",
      title: "Check & Approve",
      description: "We do the heavy lifting. You just give the final thumbs up on anything important from your dashboard."
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#FAFAF8] py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-[#1F2937]/20" />
                <span className="text-[#1F2937]/50 uppercase tracking-[0.2em] text-xs font-semibold">
                How It Works
                </span>
            </div>
            <h2 className="text-5xl font-bold text-[#1F2937] mb-16 tracking-tight leading-[1.1]">
              Simple to <br />
              <span className="text-[#1F2937]/30 italic">get started.</span>
            </h2>
            
            <div className="space-y-16">
              {steps.map((item, idx) => (
                <div key={idx} className="flex gap-10 group">
                  <div className="text-4xl font-bold text-[#1F2937]/10 group-hover:text-[#1F2937] transition-all duration-500 tabular-nums">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4 tracking-tight uppercase tracking-widest text-xs opacity-60">{item.title}</h3>
                    <p className="text-[#1F2937]/60 leading-relaxed max-w-sm font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-[#1F2937] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="relative h-full w-full flex flex-col font-mono text-[10px] text-white/20">
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-white/20" />
                             <div className="w-2 h-2 rounded-full bg-white/10" />
                        </div>
                        <span className="uppercase tracking-widest text-white/40">activity_log</span>
                    </div>
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="mb-3 flex gap-4 overflow-hidden whitespace-nowrap">
                            <span className="opacity-10 shrink-0">{String(i * 254).padStart(4, '0')}</span>
                            <div 
                                className="h-1 rounded bg-white/40" 
                                style={{ width: `${Math.random() * 80 + 20}%` }} 
                            />
                        </div>
                    ))}
                    
                    <div className="mt-auto grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                             <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-2">STATUS</p>
                             <div className="h-1 w-full bg-white/10 rounded-full mb-2">
                                 <div className="h-full w-3/4 bg-white/60 rounded-full" />
                             </div>
                             <p className="text-white text-xs font-bold font-sans">ALL GOOD</p>
                         </div>
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                             <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-2">SPEED</p>
                             <p className="text-white text-lg font-bold font-sans tracking-tight">Instant</p>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Overlay element */}
            <div className="absolute -top-12 -right-12 bg-[#FAFAF8] p-8 rounded-[2rem] shadow-2xl border border-[#1F2937]/5 max-w-[280px] group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform duration-700">
                <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm" />
                     </div>
                     <p className="text-[#1F2937] font-bold text-sm">LowFi AI</p>
                </div>
                <p className="text-[12px] text-[#1F2937]/50 font-medium leading-relaxed">
                    Reading your invoice PDF... <br />
                    <span className="text-[#1F2937] font-bold">Matched: 99.98% accurate</span>
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
