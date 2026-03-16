'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Send, Pause, Play, StopCircle, Edit2, Trash2, Calendar, Target, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: string;
  isSequence: boolean;
  sequenceType?: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  createdAt: string;
  updatedAt: string;
  sequences?: any[];
  statusHistory?: any[];
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to ${action} campaign`);
      await fetchCampaign();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} campaign`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      router.push('/dashboard/campaigns');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign');
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

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#1F2937]/60 hover:text-[#1F2937] hover:bg-[#1F2937]/5 transition-all mb-8 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <div className="text-center py-24 bg-[#FAFAF8] rounded-[2.5rem] border-2 border-[#1F2937] shadow-[4px_4px_0px_0px_#1F2937]">
            <h3 className="text-xl font-bold text-[#1F2937]">Campaign not found</h3>
            <p className="text-[#1F2937]/60 mt-2">The campaign you are looking for does not exist or has been deleted.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-[#1F2937]/5 text-[#1F2937]',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-[#FFD700] text-[#1F2937]',
      completed: 'bg-[#4ADE80] text-[#1F2937]',
      paused: 'bg-orange-100 text-orange-700',
      stopped: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.draft;
  };

  const openRate = campaign.sentCount > 0 
    ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)
    : '0';

  const clickRate = campaign.sentCount > 0
    ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Top Navigation & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link
              href="/dashboard/campaigns"
              className="inline-flex items-center gap-2 text-[#1F2937]/40 hover:text-[#1F2937] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Campaigns</span>
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">{campaign.name}</h1>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 border-[#1F2937] ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[#1F2937]/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold">{campaign.isSequence ? 'Multi-step Campaign' : 'Single Campaign'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/campaigns/${campaignId}/edit`}>
              <Button variant="secondary" className="gap-2 cursor-pointer">
                <Edit2 className="w-4 h-4" />
                Edit Campaign
              </Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} className="p-3 cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Sent', value: campaign.sentCount, sub: 'Total emails' },
            { label: 'Open Rate', value: `${openRate}%`, sub: `${campaign.openedCount} Opened` },
            { label: 'Click Rate', value: `${clickRate}%`, sub: `${campaign.clickedCount} Clicked` },
            { label: 'Replies', value: campaign.repliedCount, sub: 'Active responses' }
          ].map((stat, i) => (
            <Card key={i} className="p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[#1F2937]/5">
                <Activity className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-[#1F2937]">{stat.value}</h3>
              <p className="text-[10px] font-bold text-[#1F2937]/60 mt-2">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Campaign Actions */}
        <div className="flex flex-wrap gap-4 items-center p-6 bg-[#1F2937] rounded-[2rem] shadow-[8px_8px_0px_0px_#1F2937]/20">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Actions</p>
            <p className="text-white text-sm font-medium">Manage this campaign.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {campaign.status === 'draft' && (
              <>
                <Button 
                  onClick={() => handleAction('send')} 
                  className="bg-[#4ADE80] border-[#1F2937] text-[#1F2937] hover:bg-[#22C55E] gap-2"
                >
                  <Send className="w-4 h-4" />
                  Initiate Sequence
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard/campaigns')} 
                  variant="secondary" className="text-white border-white/20 hover:bg-white/10"
                >
                  Plan Schedule
                </Button>
              </>
            )}

            {(campaign.status === 'sending' || campaign.status === 'scheduled') && (
              <Button 
                onClick={() => handleAction('pause')} 
                className="bg-orange-400 border-[#1F2937] text-[#1F2937] hover:bg-orange-500 gap-2"
              >
                <Pause className="w-4 h-4" />
                Suspend Logic
              </Button>
            )}

            {campaign.status === 'paused' && (
              <Button 
                onClick={() => handleAction('resume')} 
                className="bg-[#4ADE80] border-[#1F2937] text-[#1F2937] hover:bg-[#22C55E] gap-2"
              >
                <Play className="w-4 h-4" />
                Resume Propagation
              </Button>
            )}

            {campaign.status !== 'stopped' && campaign.status !== 'completed' && (
              <Button 
                onClick={() => handleAction('stop')} 
                className="bg-red-500 border-[#1F2937] text-[#1F2937] hover:bg-red-600 gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Terminate
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-1">Email Content</p>
                  <h2 className="text-2xl font-black text-[#1F2937]">Message</h2>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Subject Line</p>
                  <div className="p-4 bg-[#FAFAF8] border-2 border-[#1F2937] rounded-2xl font-bold text-[#1F2937]">
                    {campaign.subject}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Email Body</p>
                  <div className="p-6 bg-[#FAFAF8] border-2 border-[#1F2937] rounded-[2rem] font-medium text-[#1F2937] whitespace-pre-wrap leading-relaxed">
                    {campaign.body}
                  </div>
                </div>
              </div>
            </Card>

            {/* Sequence Logic */}
            {campaign.isSequence && (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-1">Follow-up Emails</p>
                    <h2 className="text-2xl font-black text-[#1F2937]">Email Sequence</h2>
                  </div>
                  <Link href={`/dashboard/campaigns/${campaignId}/sequences`}>
                    <Button variant="secondary">Configure Nodes</Button>
                  </Link>
                </div>

                {campaign.sequences && campaign.sequences.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.sequences.map((seq: any, idx: number) => (
                      <div key={seq.id} className="flex items-center gap-6 p-4 bg-[#FAFAF8] border-2 border-[#1F2937] rounded-3xl group hover:shadow-[4px_4px_0px_0px_#1F2937] transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-[#1F2937] text-white flex items-center justify-center font-black">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-[#1F2937]">{seq.subject}</p>
                          <p className="text-[10px] font-bold text-[#1F2937]/40 uppercase tracking-widest">Delay: T+{seq.delayDays}D</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#1F2937] ${
                          seq.enabled ? 'bg-[#4ADE80]' : 'bg-[#1F2937]/10 opacity-50'
                        }`}>
                          {seq.enabled ? 'Active' : 'Muted'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-[#1F2937]/20 rounded-[2.5rem]">
                    <p className="text-[#1F2937]/40 font-bold mb-4">No follow-up emails configured yet.</p>
                    <Link href={`/dashboard/campaigns/${campaignId}/sequences`}>
                      <Button variant="secondary">Initialize Sequence</Button>
                    </Link>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Campaign Details */}
          <div className="space-y-6">
            <Card className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-6">Details</p>
              <div className="space-y-6">
                {[
                  { label: 'Campaign ID', value: campaign.id, mono: true },
                  { label: 'Type', value: campaign.isSequence ? 'Multi-step' : 'Single' },
                  { label: 'Created', value: new Date(campaign.createdAt).toLocaleDateString() },
                  { label: 'Updated', value: new Date(campaign.updatedAt).toLocaleTimeString() }
                ].map((item, i) => (
                  <div key={i} className="pb-4 border-b-2 border-[#1F2937]/5 last:border-0 last:pb-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-1">{item.label}</p>
                    <p className={`text-sm font-bold text-[#1F2937] ${item.mono ? 'font-mono text-[11px]' : ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-[#1F2937] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">System Notice</p>
              <p className="text-sm font-medium leading-relaxed mb-6">
                All campaigns are processed securely with reliable delivery.
              </p>
              <Button 
                onClick={() => router.push('/dashboard/activity')}
                className="w-full bg-white text-[#1F2937] border-white hover:bg-[#FAFAF8] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
              >
                View Delivery Status
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
