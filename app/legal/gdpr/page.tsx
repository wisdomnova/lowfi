import { LandingHeader } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ShieldAlert, Database, Scale, Globe, FileText, UserCheck } from "lucide-react";

export const metadata = {
  title: "Data Rights - LowFi",
  description: "You own your data.",
};

export default function GDPRCompliance() {
  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      <LandingHeader />

      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b-2 border-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Compliance</span>
              </div>
              <h1 className="text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
                Data Rights
              </h1>
              <p className="text-xl text-slate-500 font-medium">You own your data. We're just keeping it safe for you.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-200">
               <Globe className="w-4 h-4 text-[#1F2937]" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Standards</span>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-16 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Our Stance</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">Privacy First</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We follow strict data rules (like GDPR) because it's the right thing to do. We only use your information to help you work faster, and nothing else.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Your Control</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">What you can do</h3>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "See your data", icon: FileText },
                  { title: "Fix mistakes", icon: UserCheck },
                  { title: "Delete everything", icon: Database },
                  { title: "Take it with you", icon: Globe },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl group hover:bg-slate-900 transition-all">
                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 group-hover:text-white">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Legal Basis</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase leading-tight">Why We Process Data</h3>
              </div>
              <div className="md:col-span-8 space-y-6">
                <div className="p-10 bg-[#1F2937] text-white rounded-[2.5rem] relative overflow-hidden">
                  <Scale className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-8 -mt-8" />
                  <ul className="space-y-6 relative z-10">
                    {[
                      { label: "Service Delivery", desc: "We need your data to provide and improve our services." },
                      { label: "Your Consent", desc: "We ask for your permission before processing optional data." },
                      { label: "Legal Requirements", desc: "We process data when required by law." }
                    ].map((li, i) => (
                      <li key={i} className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{li.label}</div>
                        <p className="text-sm font-medium text-slate-300">{li.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Data Protection Officer</span>
                   <span className="text-sm font-black text-slate-900 uppercase tracking-tight">dpo@lowfi.app</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-1">Matrix Revision: Jan 2026</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 italic">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
