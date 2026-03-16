import { LandingHeader } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Lock, Eye, Server, ShieldCheck, Terminal, Fingerprint } from "lucide-react";

export const metadata = {
  title: "Privacy - LowFi",
  description: "We don't sell your data. Period.",
};

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      <LandingHeader />

      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b-2 border-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Privacy</span>
              </div>
              <h1 className="text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
                Privacy
              </h1>
              <p className="text-xl text-slate-500 font-medium">We don't sell your data. Period.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-200">
               <Fingerprint className="w-4 h-4 text-[#1F2937]" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Simple Version</span>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-16 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">The Basics</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">What we know</h3>
              </div>
              <div className="md:col-span-8 space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We only keep the stuff we need to make the app work for you. This means your name, email, and the work you do inside LowFi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stuff you tell us</span>
                    <span className="text-sm font-bold text-slate-900">Your email & name</span>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stuff the app creates</span>
                    <span className="text-sm font-bold text-slate-900">Invoices & follow-up logs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Our Promise</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">How we treat it</h3>
              </div>
              <div className="md:col-span-8">
                <div className="flex flex-col gap-4">
                   {[
                     { label: "We never sell your info", icon: ShieldCheck },
                     { label: "We keep it under lock & key", icon: Lock },
                     { label: "You can delete it anytime", icon: Eye }
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Retention</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">How Long We Keep Data</h3>
              </div>
              <div className="md:col-span-8">
                <div className="bg-[#1F2937] text-white p-8 rounded-[3rem] font-mono text-sm leading-relaxed">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400 border-b border-slate-700 pb-2">
                    <Terminal className="w-4 h-4" />
                    <span className="uppercase tracking-widest text-[10px]">Data Retention</span>
                  </div>
                  <div className="space-y-2 opacity-80">
                    <p className="flex justify-between border-b border-slate-800 pb-2"><span>Account Data:</span> <span className="text-emerald-400 font-bold">Until Deletion</span></p>
                    <p className="flex justify-between border-b border-slate-800 pb-2"><span>Transaction History:</span> <span className="text-blue-400 font-bold">7 Years</span></p>
                    <p className="flex justify-between border-b border-slate-800 pb-2"><span>Logs:</span> <span className="text-amber-400 font-bold">90 Days</span></p>
                    <p className="flex justify-between"><span>Marketing Data:</span> <span className="text-slate-400">Session Only</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t-2 border-slate-50 text-center">
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Questions regarding data encapsulation?</p>
              <a href="mailto:privacy@lowfi.app" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                 Contact Privacy Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
