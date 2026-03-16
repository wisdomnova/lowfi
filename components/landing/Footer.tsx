"use client";

import Link from "next/link";
import { Twitter, Instagram, Youtube, Linkedin, Facebook } from "lucide-react";

const socials = [
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com/lowfiapp",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/lowfiapp",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@lowfiapp",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/company/lowfiapp",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/lowfiapp",
  },
];

const links = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Contact", href: "#" },
];

const legal = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "GDPR", href: "/legal/gdpr" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#FAFAF8] py-24 px-6 border-t border-[#1F2937]/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 cursor-pointer transition-transform hover:rotate-3 group">
              <div className="w-8 h-8 bg-lowfi-slate-dark rounded-lg flex items-center justify-center text-white">
                <div className="w-4 h-4 bg-white rounded-[2px]" />
              </div>
              <span className="text-xl font-bold text-lowfi-slate-dark tracking-tight">LowFi</span>
            </Link>
            <p className="text-[15px] text-[#1F2937]/50 max-w-xs leading-relaxed mb-8 font-medium">
              AI-powered tools that help small and medium businesses 
              save time on invoices, follow-ups, and support.
            </p>
            <div className="flex gap-4">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full border border-[#1F2937]/10 flex items-center justify-center text-[#1F2937]/40 hover:bg-[#1F2937] hover:text-[#FAFAF8] transition-all duration-300"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[10px] text-[#1F2937] uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Email Follow-ups</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Invoice Reconciliation</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Support Tickets</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[10px] text-[#1F2937] uppercase tracking-[0.2em] mb-8">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Security</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">API Docs</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Status</a></li>
              <li><a href="#" className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors">Compliance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[10px] text-[#1F2937] uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4">
              {legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-semibold text-[13px] text-[#1F2937]/50 hover:text-[#1F2937] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-[#1F2937]/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[12px] font-bold text-[#1F2937]/30 uppercase tracking-[0.1em]">
            PRODUCT OF <span className="text-[#1F2937]">LOIN TECH</span>
          </p>
          <p className="text-[12px] font-bold text-[#1F2937]/30 uppercase tracking-[0.1em]">
            © {currentYear} LowFi Systems / Global Rights
          </p>
        </div>
      </div>
    </footer>
  );
}
