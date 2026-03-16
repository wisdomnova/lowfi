'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit2, Trash2, Loader, GripVertical, Clock, Mail, Zap, Terminal } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Sequence {
  id: string;
  campaignId: string;
  sequenceNumber: number;
  subject: string;
  body: string;
  delayDays: number;
  enabled: boolean;
  createdAt: string;
}

interface FormData {
  subject: string;
  body: string;
  delayDays: number;
}

export default function SequencesPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingSequence, setIsAddingSequence] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    body: '',
    delayDays: 1,
  });

  useEffect(() => {
    fetchSequences();
  }, [campaignId]);

  async function fetchSequences() {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}/sequences`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch sequences');
      const data = await response.json();
      setSequences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sequences');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSequence(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.subject.trim() || !formData.body.trim()) {
      setError('Subject and body are required');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}/sequences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add follow-up');

      setFormData({ subject: '', body: '', delayDays: 1 });
      setIsAddingSequence(false);
      await fetchSequences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add follow-up');
    }
  }

  async function handleDeleteSequence(sequenceId: string) {
    if (!confirm('Delete this follow-up email?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}/sequences/${sequenceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      await fetchSequences();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleToggleSequence(sequenceId: string, enabled: boolean) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}/sequences/${sequenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (!response.ok) throw new Error('Failed to update');
      await fetchSequences();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
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
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <Link
          href={`/dashboard/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 text-[#1F2937]/40 hover:text-[#1F2937] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Campaign</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Follow-up Emails</p>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Email Sequences</h1>
            <p className="text-[#1F2937]/60 mt-2 font-medium">Add follow-up emails for campaign {campaignId.slice(0, 8)}</p>
          </div>
          {!isAddingSequence && (
            <Button
              onClick={() => setIsAddingSequence(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Follow-up Email
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-2xl text-red-600 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">!</div>
            <p className="font-bold text-sm tracking-tight">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Add Sequence Form */}
            {isAddingSequence && (
              <Card className="p-8 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4 mb-8 text-[#1F2937]">
                  <div className="w-10 h-10 rounded-2xl bg-[#1F2937] flex items-center justify-center text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Initialize New Node</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Appending to temporal chain</p>
                  </div>
                </div>

                <form onSubmit={handleAddSequence} className="space-y-8">
                  <Input
                    label="Wait (Days)"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) })}
                  />

                  <Input
                    label="Subject Line"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Follow-up from our meeting"
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
                      Response Content
                    </label>
                    <div className="relative border-2 border-[#1F2937] rounded-[2rem] bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1F2937]">
                      <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        placeholder="Write your follow-up email message..."
                        rows={6}
                        className="w-full px-6 py-4 bg-transparent text-[#1F2937] placeholder-[#1F2937]/30 focus:outline-none font-medium leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-[#4ADE80] border-[#1F2937] text-[#1F2937] hover:bg-[#22C55E]">
                      Commit Node
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsAddingSequence(false);
                        setFormData({ subject: '', body: '', delayDays: 1 });
                      }}
                      className="flex-1"
                    >
                      Abort
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Sequences List */}
            {sequences.length === 0 ? (
              <div className="p-24 text-center border-4 border-dashed border-[#1F2937]/10 rounded-[3rem] bg-[#FAFAF8] flex flex-col items-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[#1F2937]/5 flex items-center justify-center mb-6">
                  <Clock className="w-10 h-10 text-[#1F2937]/20" />
                </div>
                <h3 className="text-2xl font-black text-[#1F2937] mb-2">No Follow-ups</h3>
                <p className="text-[#1F2937]/60 font-medium mb-8">Add follow-up emails to send after the initial campaign.</p>
                {!isAddingSequence && (
                  <Button
                    onClick={() => setIsAddingSequence(true)}
                    className="gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Follow-up
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sequences.map((seq, idx) => (
                  <div
                    key={seq.id}
                    className="group bg-[#FAFAF8] rounded-[2.5rem] border-2 border-[#1F2937] p-8 shadow-[4px_4px_0px_0px_#1F2937] transition-all hover:translate-y-[-2px]"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#1F2937] text-white flex items-center justify-center font-black shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="min-w-0 pr-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-1">Step Information</p>
                            <h3 className="text-xl font-black text-[#1F2937] truncate">
                              {seq.subject}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group/toggle">
                              <span className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">
                                {seq.enabled ? 'Live' : 'Muted'}
                              </span>
                              <button
                                onClick={() => handleToggleSequence(seq.id, seq.enabled)}
                                className={`w-12 h-6 rounded-full border-2 border-[#1F2937] relative transition-colors ${seq.enabled ? 'bg-[#4ADE80]' : 'bg-[#1F2937]/10'}`}
                              >
                                <div className={`absolute top-0.5 bottom-0.5 w-4 h-4 rounded-full bg-[#1F2937] transition-all ${seq.enabled ? 'right-0.5' : 'left-0.5'}`} />
                              </button>
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1F2937]/5 rounded-full border border-[#1F2937]/10">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1F2937]/60">Delay: T+{seq.delayDays}D</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1F2937]/5 rounded-full border border-[#1F2937]/10">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1F2937]/60">Payload: Verified</span>
                          </div>
                        </div>

                        <div className="bg-white border-2 border-[#1F2937] rounded-[1.5rem] p-4 mb-6">
                          <p className="text-xs text-[#1F2937]/60 font-medium whitespace-pre-wrap line-clamp-3 leading-relaxed">
                            {seq.body}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="secondary" className="text-xs h-9 px-4 opacity-50 cursor-not-allowed">
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            Modify Node
                          </Button>
                          <Button 
                            variant="danger" 
                            className="text-xs h-9 px-4"
                            onClick={() => handleDeleteSequence(seq.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Destroy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-8 bg-[#1F2937] text-white">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Terminal className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Sequential Logic Rules</p>
              <ul className="space-y-4">
                {[
                  { icon: Zap, text: 'Nodes propagate automatically based on T-delay.' },
                  { icon: Terminal, text: 'Global campaign must be ACTIVE for nodes to trigger.' },
                  { icon: Mail, text: 'Reciprocal interactions bypass remaining nodes.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs font-bold leading-relaxed text-white/80">
                    <item.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/40" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-dashed border-[#1F2937]/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-4">Note</p>
              <p className="text-[11px] font-bold text-[#1F2937]/60 leading-relaxed">
                Sequence ordering is based on delay settings. Manual drag-and-drop reordering is coming soon.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
