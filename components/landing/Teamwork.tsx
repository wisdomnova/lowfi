"use client";

import { motion } from "framer-motion";
import { Users, UserPlus, ShieldCheck } from "lucide-react";

export function Teamwork() {
  return (
    <section className="py-32 px-6 bg-[#FAFAF8] border-t border-[#1F2937]/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            {/* High-Fi Modal Mockup representing our Team Invite work */}
            <div className="bg-white border-4 border-[#1F2937] p-8 shadow-[12px_12px_0px_0px_#1F2937] rounded-xl max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1F2937]/5 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#1F2937]" />
                </div>
                <h4 className="font-bold text-[#1F2937]">Invite Team</h4>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-full border-2 border-[#1F2937]/10 rounded-lg bg-[#FAFAF8]" />
                <div className="h-10 w-full border-2 border-[#1F2937]/10 rounded-lg bg-[#FAFAF8]" />
                <div className="h-12 w-full bg-[#1F2937] rounded-lg mt-6" />
              </div>
              <div className="mt-8 pt-6 border-t border-[#1F2937]/5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1F2937]/10" />
                <div className="w-8 h-8 rounded-full bg-[#1F2937]/10" />
                <div className="w-8 h-8 rounded-full bg-[#1F2937]/10" />
                <div className="text-[10px] font-bold text-[#1F2937]/40 uppercase tracking-widest">+ YOU</div>
              </div>
            </div>
            
            {/* Background decorative element */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#1F2937]/5 blur-3xl -z-10 rounded-full" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-[#1F2937]/20" />
                <span className="text-[#1F2937]/50 uppercase tracking-[0.2em] text-xs font-semibold">
                Teamwork
                </span>
            </div>
            <h2 className="text-5xl font-bold text-[#1F2937] mb-8 tracking-tight leading-[1.1]">
              Work better, <br />
              <span className="text-[#1F2937]/30 italic">together.</span>
            </h2>
            <p className="text-[#1F2937]/60 text-xl leading-relaxed mb-12 font-medium">
              Invite your whole team in seconds. No more asking "did you get that done?" 
              Everyone can see exactly what's happening and help out whenever it's needed.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-[#1F2937] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2937] mb-1">Everyone in one place</h4>
                  <p className="text-[#1F2937]/60 text-sm">No more messy email chains or lost notes.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-white border-2 border-[#1F2937]/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#1F2937]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2937] mb-1">Simple permissions</h4>
                  <p className="text-[#1F2937]/60 text-sm">You decide who can see what. Keep things private or share with the group.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
