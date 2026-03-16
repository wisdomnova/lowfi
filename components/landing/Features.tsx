"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  FileText,
  Mail,
  CheckCircle2,
  Layout,
  Lock,
  Zap,
} from "lucide-react";

const features = [
  {
    tag: "Paperwork",
    icon: FileText,
    title: "Automated Invoices",
    description:
      "We match your receipts and invoices automatically. If something doesn't add up, we'll let you know immediately.",
  },
  {
    tag: "Sales",
    icon: Mail,
    title: "Never Forget a Client",
    description:
      "We send friendly follow-up emails for you. You'll get more replies and finish deals faster without having to remember who to email next.",
  },
  {
    tag: "Support",
    icon: CheckCircle2,
    title: "Happy Customers, Fast",
    description:
      "See all your customer questions in one simple list. We even write draft replies for you so you can help people in seconds.",
  },
  {
    tag: "Safety",
    icon: Lock,
    title: "Bank-Level Security",
    description:
      "Your data is kept under lock and key. We use the same security as banks so you never have to worry about your information.",
  },
  {
    tag: "Results",
    icon: Zap,
    title: "See Your Progress",
    description:
      "Get simple reports that show you exactly how much time you're saving. No complicated charts, just the facts.",
  },
  {
    tag: "Setup",
    icon: Layout,
    title: "Works With Your Tools",
    description:
      "You don't need to change how you work. We plug right into the apps you already use every day.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[#FAFAF8] py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-[#1F2937]/20" />
            <span className="text-[#1F2937]/50 uppercase tracking-[0.2em] text-xs font-semibold">
              Features
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#1F2937] tracking-tight mb-8 leading-[1.1]">
            Everything you need to <br />
            <span className="text-[#1F2937]/40">save hours every day.</span>
          </h2>
          <p className="max-w-2xl text-[#1F2937]/60 text-xl leading-relaxed">
            No more switching between spreadsheets and messy inboxes. 
            LowFi takes care of the boring, time-consuming tasks so you can get home on time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2937]/5 border border-[#1F2937]/10">
                  <span className="text-[10px] font-bold text-[#1F2937]/60 uppercase tracking-wider">{feature.tag}</span>
                </div>
                
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-[#1F2937]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                  <Icon className="w-8 h-8 text-[#1F2937] relative" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-bold text-[#1F2937] mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#1F2937]/60 leading-relaxed text-[16px]">
                  {feature.description}
                </p>
                
                <div className="mt-8 flex items-center gap-2 text-[#1F2937] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <div className="w-4 h-[1px] bg-[#1F2937]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
