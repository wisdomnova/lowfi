'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, Terminal, ArrowRight, Save, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { EmailContentEditor } from '@/components/email-content-editor';
import { Button } from '@/components/ui/Button';

export default function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    isSequence: false,
    sequenceType: 'sequential',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError('Campaign name is required');
        return;
      }
      if (!formData.subject.trim()) {
        setError('Subject line is required');
        return;
      }
      if (!formData.body.trim()) {
        setError('Campaign body is required');
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          isSequence: formData.isSequence,
          sequenceType: formData.isSequence ? formData.sequenceType : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const campaign = await response.json();
      router.push(`/dashboard/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/campaigns"
            className="w-10 h-10 bg-white border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center hover:border-slate-900 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Campaigns</span>
             <ArrowRight className="w-3 h-3 text-slate-300" />
             <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Create Campaign</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
               <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Campaign Setup</span>
            </div>
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
              Create Campaign
            </h1>
            <p className="text-lg text-slate-500 font-medium">Set up your campaign details and email content.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               variant="secondary" 
               size="lg"
               onClick={() => router.push('/dashboard/campaigns')}
               className="h-12 px-8"
             >
               Cancel
             </Button>
             <Button 
               onClick={handleSubmit}
               isLoading={loading}
               size="lg"
               className="h-12 px-10"
             >
               <Save className="w-4 h-4" />
               Create Campaign
             </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-6 bg-red-50 border-2 border-red-100 text-red-700 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            <Shield className="w-6 h-6 shrink-0" />
            <div className="font-black text-[11px] uppercase tracking-widest">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Configuration Surface */}
          <div className="lg:col-span-8 space-y-12">
            {/* Campaign Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200">
                  01
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">Campaign Details</h3>
              </div>

              <div className="bg-white border-2 border-[#E5E7EB] rounded-[2.5rem] p-12 shadow-[15px_15px_0px_0px_rgba(0,0,0,0.02)] space-y-10">
                <div className="space-y-4">
                  <label htmlFor="name" className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Campaign Name *</label>
                  <div className="flex items-center bg-white border border-[#E5E7EB] rounded-2xl h-16 transition-all focus-within:border-[#1F2937] group mx-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Q4 Product Launch"
                      className="flex-1 bg-transparent border-none px-6 font-black text-base tracking-tight outline-none focus:ring-0 placeholder:text-slate-300 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="mx-1 flex items-start gap-4 p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl">
                   <Terminal className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                   <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                     Give your campaign a clear, descriptive name. This helps you identify and organize campaigns across your dashboard.
                   </p>
                </div>
              </div>
            </section>

            {/* Email Content */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200">
                  02
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">Email Content</h3>
              </div>

              <div className="bg-white border-2 border-[#E5E7EB] rounded-[3.5rem] p-16 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)] overflow-hidden">
                <EmailContentEditor
                  subject={formData.subject}
                  onSubjectChange={(val) => handleFieldChange('subject', val)}
                  content={formData.body}
                  onContentChange={(val) => handleFieldChange('body', val)}
                />
              </div>
            </section>

            {/* Campaign Type */}
            <section className="space-y-6 pb-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200">
                  03
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">Campaign Type</h3>
              </div>

              <div className="bg-white border-2 border-[#E5E7EB] rounded-[2.5rem] p-12 shadow-[15px_15px_0px_0px_rgba(0,0,0,0.02)] space-y-10">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Follow-up Emails</h4>
                    <p className="text-xs text-slate-500 font-medium">Send multiple follow-up emails to your recipients.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSequence"
                      checked={formData.isSequence}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-16 h-8 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-slate-900" />
                  </label>
                </div>

                {formData.isSequence && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                        <ArrowRight className="w-4 h-4 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sequence Mode</p>
                        <p className="text-sm font-bold text-slate-900">Sequential — emails sent one after another at scheduled intervals.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Status */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-12 space-y-8">
              {/* Campaign Stats Card */}
              <div className="bg-[#1F2937] rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Shield className="w-32 h-32" />
                </div>
                
                <div className="space-y-2 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">Campaign Status</span>
                  <div className="text-3xl font-black uppercase tracking-tight">Ready</div>
                </div>

                <div className="space-y-6 relative z-10">
                  {[
                    { label: 'Email Content', status: formData.body ? 'Verified' : 'Pending', val: formData.body ? 100 : 0 },
                    { label: 'Recipients', status: 'Ready', val: 100 },
                    { label: 'Email Service', status: 'Active', val: 100 }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                          <span>{stat.label}</span>
                          <span className={stat.status === 'Verified' || stat.status === 'Ready' || stat.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}>{stat.status}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-1000" style={{ width: `${stat.val}%` }} />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                   <span>Ref: #{Math.floor(Math.random()*10000)}</span>
                   <span>Status: Draft</span>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-[#FAFAF8] border-2 border-[#E5E7EB] rounded-[2.5rem] p-10 space-y-8">
                 <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Campaign Tips</h4>
                 </div>
                 <ul className="space-y-6">
                    {[
                      { icon: Shield, text: "Keep subject lines under 50 characters for better readability." },
                      { icon: Zap, text: "Follow-up emails increase engagement by 12%." },
                      { icon: Terminal, text: "Use merge tags like {{firstName}} to personalize emails." }
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-4 group">
                        <tip.icon className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                        <span className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{tip.text}</span>
                      </li>
                    ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
