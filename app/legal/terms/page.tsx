import { LandingHeader } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FileText, Shield, Scale, Zap, Globe, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Rules - LowFi",
  description: "Simple rules for using LowFi.",
};

export default function TermsOfService() {
  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      <LandingHeader />

      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b-2 border-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Legal</span>
              </div>
              <h1 className="text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
                Rules
              </h1>
              <p className="text-xl text-slate-500 font-medium">Be nice, play fair, and we'll get along great.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-200">
               <FileText className="w-4 h-4 text-[#1F2937]" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Simple Version</span>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-16 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Rule 1</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">By Using LowFi</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  When you use LowFi, you're agreeing to follow these simple rules. If you don't like them, that's okay—but you can't use the app.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Rule 2</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">Don't break things</h3>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                    <Zap className="w-6 h-6 text-blue-500 mb-4" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Good behavior</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Use LowFi to help your business grow and make your life easier.</p>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mb-4" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Bad behavior</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">No hacking, no spamming, and no trying to break the system on purpose.</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Rule 3</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">The Legal Stuff</h3>
              </div>
              <div className="md:col-span-8">
                <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] relative overflow-hidden">
                  <Shield className="absolute bottom-0 right-0 w-48 h-48 opacity-5 -mb-12 -mr-12" />
                  <p className="text-sm font-medium text-slate-300 leading-relaxed mb-6 italic">
                  We built this tool to be helpful, but we can't promise it will always be perfect. We aren't responsible if things go wrong outside of our control.
                  </p>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Governed by simple common sense</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 opacity-80">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Last Updated: January 2026</div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Current Version</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
