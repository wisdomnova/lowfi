'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader, Save, X, Lightbulb, ArrowRight, Settings, PenTool } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  isSequence: boolean;
  sequenceType?: string;
}

type SequenceType = 'sequential';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    isSequence: false,
    sequenceType: 'sequential' as SequenceType,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  async function fetchCampaign() {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch campaign');
      const campaign: Campaign = await response.json();

      const sequenceType: SequenceType = (campaign.sequenceType || 'sequential') as SequenceType;

      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        body: campaign.body,
        isSequence: campaign.isSequence,
        sequenceType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setError('Required parameters missing: [name, subject, body]');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logic update failed');
      }

      router.push(`/dashboard/campaigns/${campaignId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Critical update error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="w-12 h-12 border-4 border-[#1F2937]/10 border-t-[#1F2937] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <Link
          href={`/dashboard/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 text-[#1F2937]/40 hover:text-[#1F2937] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Campaign Editor</p>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Edit Campaign</h1>
            <p className="text-[#1F2937]/60 mt-2 font-medium">Update your campaign settings</p>
          </div>
          <div className="flex gap-3">
             <Link href={`/dashboard/campaigns/${campaignId}`}>
              <Button variant="secondary" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="gap-2 cursor-pointer"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-2xl text-red-600 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">!</div>
            <p className="font-bold text-sm tracking-tight">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-12">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 px-2 block">Campaign Name</label>
                  <div className="flex items-center bg-white border border-[#E5E7EB] rounded-2xl h-16 transition-all focus-within:border-[#1F2937] group mx-1">
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Q4 Launch Campaign"
                      className="flex-1 bg-transparent border-none px-6 font-black text-base tracking-tight outline-none focus:ring-0 placeholder:text-[#1F2937]/30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 px-2 block">Subject Line</label>
                  <div className="flex items-center bg-white border border-[#E5E7EB] rounded-2xl h-16 transition-all focus-within:border-[#1F2937] group mx-1">
                    <input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Your Q4 Update"
                      className="flex-1 bg-transparent border-none px-6 font-black text-base tracking-tight outline-none focus:ring-0 placeholder:text-[#1F2937]/30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 px-2 block">
                    Email Body
                  </label>
                  <div className="mx-1 border border-[#E5E7EB] rounded-[2rem] bg-white overflow-hidden transition-all focus-within:border-[#1F2937]">
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Write your email message here..."
                      rows={12}
                      className="w-full px-8 py-6 bg-transparent text-[#1F2937] placeholder-[#1F2937]/30 focus:outline-none font-black leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Campaign Type */}
            <Card className="p-12">
              <div className="flex items-center gap-4 mb-10 px-2">
                <div className="w-10 h-10 rounded-2xl bg-[#1F2937] flex items-center justify-center text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1F2937] tracking-tight truncate">Campaign Type</h3>
                  <p className="text-[10px] font-bold text-[#1F2937]/40 uppercase tracking-widest mt-0.5">Single or multi-step</p>
                </div>
              </div>

              <div className="space-y-6 px-2">
                <label className="flex items-center gap-4 p-8 border border-[#E5E7EB] rounded-[2rem] bg-[#FAFAF8] cursor-pointer group transition-all hover:border-[#1F2937]">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={formData.isSequence}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSequence: e.target.checked,
                          sequenceType: e.target.checked ? 'sequential' : ('sequential' as SequenceType),
                        })
                      }
                      className="peer appearance-none w-6 h-8 border border-[#E5E7EB] rounded-lg checked:bg-[#1F2937] transition-all"
                    />
                    <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-[#1F2937] uppercase text-sm tracking-tight">Enable Multi-step Sequence</p>
                    <p className="text-xs text-[#1F2937]/60 font-medium">Send multiple follow-up emails at scheduled intervals.</p>
                  </div>
                </label>

                {formData.isSequence && (
                  <div className="animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4 p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                        <ArrowRight className="w-4 h-4 text-[#1F2937]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Sequence Mode</p>
                        <p className="text-sm font-bold text-[#1F2937]">Sequential — emails sent one after another at scheduled intervals.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 bg-[#1F2937] text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 font-mono">Status: Editing</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-white/80">
                    Transmission parameters must be finalized before initiating propagation.
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Notice</p>
                  <p className="text-[11px] font-medium text-white/60 leading-relaxed">
                    Personalization markers like <code className="bg-white/10 px-1 rounded">{"{{receiver_email}}"}</code> are active.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-dashed border-[#1F2937]/20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-[2rem] bg-[#1F2937]/5 flex items-center justify-center mb-4">
                <PenTool className="w-8 h-8 text-[#1F2937]/20" />
              </div>
              <p className="text-sm font-black text-[#1F2937]/40 px-4">
                Multi-step emails can be added after creating this campaign.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
