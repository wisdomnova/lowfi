import { LandingHeader } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ShieldCheck, Lock, EyeOff, Server, Terminal, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Security - LowFi.app",
  description: "How we keep your business safe.",
};

export default function SecurityPage() {
  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      <LandingHeader />

      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b-2 border-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F2937] text-white rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Safety</span>
              </div>
              <h1 className="text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
                Security
              </h1>
              <p className="text-xl text-slate-500 font-medium">Your business stays your business.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 shadow-sm">
               <Lock className="w-4 h-4 text-[#1F2937]" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Always On</span>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-16 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">The Vault</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">Bank-Level Safety</h3>
              </div>
              <div className="md:col-span-8 space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We use the strongest encryption available (the same kind banks use) to make sure your data is unreadable to anyone but you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <EyeOff className="w-6 h-6 text-[#1F2937] mb-3" />
                    <span className="text-sm font-bold text-slate-900">Encrypted at all times</span>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <Server className="w-6 h-6 text-[#1F2937] mb-3" />
                    <span className="text-sm font-bold text-slate-900">Stored on secure servers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Our Process</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">How we work</h3>
              </div>
              <div className="md:col-span-8">
                <div className="flex flex-col gap-4">
                   {[
                     { label: "We never share your login info", icon: Lock },
                     { label: "Automatic backups every hour", icon: ShieldAlert },
                     { label: "Constant monitoring for threats", icon: Terminal }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-6 p-5 border-2 border-slate-100 rounded-[2rem] hover:border-slate-900 transition-colors group">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 text-white group-hover:bg-blue-600 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.label}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
