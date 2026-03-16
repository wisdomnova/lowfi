"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function Comparison() {
  return (
    <section className="py-32 px-6 bg-[#1F2937]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Stop the <span className="text-white/30 italic">day-to-day struggle.</span>
          </h2>
          <p className="text-white/50 text-xl max-w-2xl mx-auto font-medium">
            Running a business is hard enough. Why make the paperwork harder than it needs to be?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Life Before LowFi */}
          <div className="bg-[#FAFAF8]/5 border border-white/10 rounded-[2rem] p-10">
            <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest mb-10">Before LowFi</h3>
            <ul className="space-y-6">
              {[
                "Hours spent typing in invoice data",
                "Forgetting to follow up with new leads",
                "Customer emails lost in a messy inbox",
                "No idea where your team's time is going",
                "Switching between 10 different spreadsheets"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-white/60">
                  <div className="mt-1 bg-red-500/20 p-1 rounded">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Life With LowFi */}
          <div className="bg-white rounded-[2rem] p-10 shadow-2xl">
            <h3 className="text-xl font-bold text-[#1F2937]/40 uppercase tracking-widest mb-10">With LowFi</h3>
            <ul className="space-y-6">
              {[
                "Invoices are scanned and filed in seconds",
                "Automatic follow-ups do the selling for you",
                "Support questions sorted and ready to answer",
                "One simple feed shows everything happening",
                "One dashboard that has everything you need"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[#1F2937]">
                  <div className="mt-1 bg-green-500/10 p-1 rounded">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg font-bold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
