"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is it hard to set up?",
    answer: "Not at all. You can get started in less than 5 minutes. We connect to the tools you already use, so you don't have to start from scratch."
  },
  {
    question: "Do I have to change how I work?",
    answer: "No. LowFi works in the background. You keep doing what you're doing, and we just handle the repetitive parts for you."
  },
  {
    question: "Is my data safe?",
    answer: "We take security very seriously. We use the same encryption as major banks to ensure your business information stays private and safe."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. There are no long-term contracts. You can change your plan or cancel whenever you want with just one click."
  },
  {
    question: "How does the 'Suggested Replies' work?",
    answer: "When a customer asks a question, LowFi reads it and writes a draft reply for you. You can review it, change it, or just hit send. It saves you from typing the same answers over and over."
  }
];

export function FAQ() {
  return (
    <section className="py-32 px-6 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-[#1F2937]/20" />
            <span className="text-[#1F2937]/50 uppercase tracking-[0.2em] text-xs font-semibold">
              Got Questions?
            </span>
            <div className="w-12 h-[1px] bg-[#1F2937]/20" />
          </div>
          <h2 className="text-4xl font-bold text-[#1F2937] tracking-tight">
            Common <span className="text-[#1F2937]/30 italic">Concerns.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="group border-2 border-[#1F2937]/5 rounded-2xl p-6 hover:border-[#1F2937]/20 transition-all cursor-default"
            >
              <h3 className="text-lg font-bold text-[#1F2937] mb-3 flex items-center justify-between">
                {faq.question}
                <Plus className="w-4 h-4 text-[#1F2937]/20 group-hover:text-[#1F2937] transition-colors" />
              </h3>
              <p className="text-[#1F2937]/60 leading-relaxed font-medium">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-[#1F2937]/40 text-sm font-bold uppercase tracking-widest">
                Still unsure? <a href="mailto:support@lowfi.com" className="text-[#1F2937] underline underline-offset-4">Send us a message</a>
            </p>
        </div>
      </div>
    </section>
  );
}
