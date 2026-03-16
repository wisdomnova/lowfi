// Header component for LowFi.app
import React from "react";
import { Terminal, Activity, Zap } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[#FAFAF8] border-b-2 border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#1F2937] rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(31,41,55,0.1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">LowFi</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Business Tools</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Online</span>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Campaigns', href: '/dashboard/campaigns' },
            { label: 'Analytics', href: '/dashboard/analytics' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-[#1F2937] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1F2937] transition-all group-hover:w-full" />
            </Link>
          ))}
          
          <Link
            href="/dashboard/settings"
            className="w-12 h-12 bg-white border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center hover:border-slate-900 transition-all group"
          >
            <Zap className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
