import { LandingHeader } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Shield, Cookie, Activity, Lock } from "lucide-react";

export const metadata = {
  title: "Cookies - LowFi",
  description: "Simple explanation of how we use cookies.",
};

export default function CookiePolicy() {
  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      <LandingHeader />

      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b-2 border-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
                <Cookie className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Privacy</span>
              </div>
              <h1 className="text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
                Cookies
              </h1>
              <p className="text-xl text-slate-500 font-medium">Small files that help us remember who you are.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 shadow-sm">
               <Activity className="w-4 h-4 text-emerald-500" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Simple Version</span>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-16 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">The Basics</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase">What are they?</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  Cookies are just tiny bits of information your browser saves for us. They help you stay logged in and make sure the app loads fast.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Why?</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase">How we use them</h3>
              </div>
              <div className="md:col-span-8 space-y-8">
                {[
                  {
                    title: "Essential stuff",
                    desc: "Things we need to keep you logged in and keep your account safe. You can't turn these off, or the app won't work.",
                    icon: Lock,
                    color: "bg-blue-50 text-blue-600"
                  },
                  {
                    title: "Better experience",
                    desc: "These help us see which parts of the app people use the most so we can keep making them better for you.",
                    icon: Activity,
                    color: "bg-emerald-50 text-emerald-600"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 p-8 bg-[#FAFAF8] rounded-3xl border-2 border-slate-100 group hover:border-slate-900 transition-all">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{item.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Control</h2>
                <h3 className="text-2xl font-black text-[#1F2937] tracking-tighter uppercase">Managing Cookies</h3>
              </div>
              <div className="md:col-span-8 space-y-6 text-slate-600">
                <p className="font-medium leading-relaxed">
                  You can control cookies through your browser settings. Note that disabling cookies may affect some features of the platform:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Chrome', 'Safari', 'Firefox', 'Edge'].map((browser) => (
                    <div key={browser} className="px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-sm text-slate-800">
                      {browser} Privacy Settings
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-12 border-t-2 border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Version: 1.0 • Updated Jan 2026</span>
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Last Updated: Jan 2026</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
