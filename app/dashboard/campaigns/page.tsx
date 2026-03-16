'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Send, 
  Pause, 
  Play, 
  StopCircle, 
  Eye, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Zap, 
  Workflow, 
  Mail, 
  Users, 
  Link2, 
  Shield, 
  CheckCircle,
  MoreVertical,
  Filter,
  Search,
  ArrowUpRight,
  ChevronRight,
  Edit2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/EmptyState';
import { CardSkeleton } from '@/components/Skeleton';
import { ScheduleModal, type ScheduleData } from '@/components/modals/ScheduleModal';
import { ABTestModal, type ABTestData } from '@/components/modals/ABTestModal';
import { AutomationModal, type AutomationData } from '@/components/modals/AutomationModal';
import { EmailContentModal, type EmailContentData } from '@/components/modals/EmailContentModal';
import { RecipientModal, type RecipientData } from '@/components/modals/RecipientModal';
import { IntegrationModal, type IntegrationData } from '@/components/modals/IntegrationModal';
import { ComplianceModal, type ComplianceData } from '@/components/modals/ComplianceModal';
import { ApprovalModal, type ApprovalData } from '@/components/modals/ApprovalModal';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  isSequence: boolean;
}

function StatCard({ title, value, icon: Icon, trend, isUp, description }: any) {
  return (
    <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8 hover:border-[#1F2937] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] text-[#1F2937] transition-colors group-hover:bg-[#1F2937] group-hover:text-white group-hover:border-[#1F2937]">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] leading-none mb-3">{title}</p>
        <h3 className="text-4xl font-bold text-[#1F2937] leading-none mb-3 tracking-tight">{value}</h3>
        <p className="text-xs text-[#6B7280] font-medium">{description}</p>
      </div>
    </Card>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const router = useRouter();

  // Modal states
  const [scheduleModal, setScheduleModal] = useState(false);
  const [abTestModal, setAbTestModal] = useState(false);
  const [automationModal, setAutomationModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [recipientModal, setRecipientModal] = useState(false);
  const [integrationModal, setIntegrationModal] = useState(false);
  const [complianceModal, setComplianceModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const url = statusFilter === 'all' 
        ? '/api/campaigns?limit=100'
        : `/api/campaigns?status=${statusFilter}&limit=100`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      setCampaigns(campaigns.filter(c => c.id !== id));
      showNotification('success', 'Campaign deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Failed to delete campaign');
    }
  }

  async function sendCampaign(id: string) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to send');
      showNotification('success', 'Campaign initiated successfully!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Failed to send campaign');
    }
  }

  async function pauseCampaign(id: string) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${id}/pause`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to pause');
      showNotification('success', 'Campaign paused');
      fetchCampaigns();
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Failed to pause campaign');
    }
  }

  async function resumeCampaign(id: string) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/campaigns/${id}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to resume');
      showNotification('success', 'Campaign resumed');
      fetchCampaigns();
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Failed to resume campaign');
    }
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 font-bold',
      scheduled: 'bg-blue-50 text-blue-700 font-bold',
      sending: 'bg-emerald-50 text-emerald-700 font-bold',
      completed: 'bg-indigo-50 text-indigo-700 font-bold',
      paused: 'bg-amber-50 text-amber-700 font-bold',
      stopped: 'bg-red-50 text-red-700 font-bold',
    };
    return styles[status] || styles.draft;
  };

  const openRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return '0%';
    return `${Math.round((campaign.openedCount / campaign.sentCount) * 100)}%`;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Modal handlers
  const handleScheduleSave = async (data: ScheduleData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save schedule');
      showNotification('success', 'Schedule saved successfully!');
      setScheduleModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleABTestSave = async (data: ABTestData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/ab-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create A/B test');
      showNotification('success', 'A/B test created successfully!');
      setAbTestModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleAutomationSave = async (data: AutomationData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/automations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create automation');
      showNotification('success', 'Automation created successfully!');
      setAutomationModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleEmailSave = async (data: EmailContentData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/email-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save email content');
      showNotification('success', 'Email content saved successfully!');
      setEmailModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleRecipientSave = async (data: RecipientData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to import recipients');
      showNotification('success', 'Recipients imported successfully!');
      setRecipientModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleIntegrationSave = async (data: IntegrationData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save integration');
      showNotification('success', 'Integration connected successfully!');
      setIntegrationModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleComplianceSave = async (data: ComplianceData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save compliance settings');
      showNotification('success', 'Compliance settings saved!');
      setComplianceModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  const handleApprovalSave = async (data: ApprovalData) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/approvals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save approval settings');
      showNotification('success', 'Approval workflow set!');
      setApprovalModal(false);
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter">Campaigns</h1>
            <p className="text-lg text-[#6B7280] font-medium max-w-lg leading-relaxed">Overview of all your email campaigns and their performance metrics.</p>
          </div>
          <Link href="/dashboard/campaigns/create">
            <Button size="lg" className="h-12 px-6">
              <Plus className="w-5 h-5 text-emerald-400" /> Create Campaign
            </Button>
          </Link>
        </div>

        {/* Campaign Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Sending" 
            value={campaigns.filter(c => c.status === 'sending').length} 
            icon={Send} 
            trend="Active" 
            isUp={true} 
            description="campaigns"
          />
          <StatCard 
            title="Emails Sent" 
            value={campaigns.reduce((acc, current) => acc + current.sentCount, 0).toLocaleString()} 
            icon={TrendingUp} 
            trend="+12%" 
            isUp={true} 
            description="total reach"
          />
          <StatCard 
            title="Open Rate" 
            value={campaigns.length === 0 ? '0%' : Math.round((campaigns.reduce((acc, c) => acc + (c.sentCount > 0 ? c.openedCount / c.sentCount : 0), 0) / campaigns.length) * 100) + '%'} 
            icon={Eye} 
            trend="+5.4%" 
            isUp={true} 
            description="engagement"
          />
          <StatCard 
            title="Clicks" 
            value={campaigns.reduce((acc, current) => acc + current.clickedCount, 0).toLocaleString()} 
            icon={Shield} 
            trend="Active" 
            isUp={true} 
            description="total clicks"
          />
        </div>

        {/* Campaign List & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.3em] border-l-4 border-[#1F2937] pl-4">All Campaigns</h2>
                <div className="flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-2xl w-80 transition-all focus-within:border-[#1F2937] group h-14">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search campaigns..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none p-0 text-[11px] font-black focus:ring-0 focus:outline-none placeholder:text-gray-400"
                  />
                </div>
             </div>

             {loading ? (
               <div className="space-y-6">
                 <CardSkeleton />
                 <CardSkeleton />
                 <CardSkeleton />
               </div>
             ) : campaigns.length === 0 ? (
               <EmptyState 
                 title="No Campaigns Yet"
                 description="Create your first campaign to get started and track its performance."
                 icon={Mail}
                 action={{
                   label: "Create Campaign",
                   onClick: () => router.push('/dashboard/campaigns/create')
                 }}
               />
             ) : (
               <div className="space-y-8">
                 {campaigns.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject.toLowerCase().includes(searchQuery.toLowerCase())).map((campaign) => (
                   <Card key={campaign.id} className="bg-white border-2 border-[#E5E7EB] rounded-[3.5rem] p-12 shadow-[12px_12px_0px_0px_#FAFAF8] hover:shadow-[12px_12px_0px_0px_#1F2937] transition-all duration-500 group relative overflow-hidden">
                     <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 relative z-10">
                       <div className="flex-1 space-y-6">
                         <div className="flex items-center gap-4">
                           <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 ${getStatusStyle(campaign.status)}`}>
                             {campaign.status}
                           </div>
                           <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div>
                           <h3 className="text-3xl font-black text-[#1F2937] leading-tight group-hover:text-blue-600 transition-colors">
                             <Link href={`/dashboard/campaigns/${campaign.id}`}>{campaign.name}</Link>
                           </h3>
                           <p className="text-sm text-[#6B7280] font-medium mt-2 italic flex items-center gap-2">
                             <ChevronRight className="w-4 h-4 text-[#1F2937]" /> "{campaign.subject || 'No Subject'}"
                           </p>
                         </div>
                       </div>

                       <div className="grid grid-cols-3 gap-12 xl:px-12 xl:border-l xl:border-r border-[#F3F4F6]">
                         {[
                           { label: 'Sent', value: campaign.sentCount },
                           { label: 'Open Rate', value: openRate(campaign) },
                           { label: 'Clicks', value: campaign.clickedCount },
                         ].map((stat, i) => (
                           <div key={i} className="space-y-1">
                             <p className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">{stat.label}</p>
                             <p className="text-xl font-black text-[#1F2937] tabular-nums">{stat.value}</p>
                           </div>
                         ))}
                       </div>

                       <div className="flex items-center gap-3">
                         <Button 
                            variant="secondary" 
                            onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                            className="w-14 h-14 p-0 flex items-center justify-center rounded-[1.25rem] border-2 border-[#E5E7EB] hover:border-[#1F2937] transition-all"
                         >
                            <Edit2 className="w-5 h-5 text-[#1F2937]" />
                         </Button>
                         
                         {campaign.status === 'paused' || campaign.status === 'draft' ? (
                            <Button 
                              onClick={() => resumeCampaign(campaign.id)}
                              className="h-14 px-10 bg-[#1F2937] text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg active:scale-95 transition-all cursor-pointer"
                            >
                               <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" /> Send
                            </Button>
                         ) : (
                            <Button 
                              onClick={() => pauseCampaign(campaign.id)}
                              className="h-14 px-10 bg-white border-2 border-[#E5E7EB] text-[#1F2937] hover:border-[#1F2937] rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all cursor-pointer"
                            >
                               <Pause className="w-4 h-4 fill-[#1F2937]" /> Pause
                            </Button>
                         )}

                            <Button 
                              onClick={() => deleteCampaign(campaign.id)}
                              className="w-14 h-14 p-0 flex items-center justify-center rounded-[1.25rem] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform active:scale-95 cursor-pointer"
                            >
                               <Trash2 className="w-5 h-5" />
                            </Button>
                       </div>
                     </div>
                     {/* Data visualizer background */}
                     <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end p-12 -z-0">
                        <div className="flex items-end gap-1 h-24">
                           {[4,7,2,9,5,8,3,6,10,4].map((h, i) => (
                             <div key={i} className="w-2 bg-[#1F2937]/10 rounded-full" style={{ height: `${h * 10}%` }} />
                           ))}
                        </div>
                     </div>
                   </Card>
                 ))}
               </div>
             )}
          </div>

          <div className="space-y-12">
             <div>
                <h2 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.3em] mb-8 border-l-4 border-emerald-400 pl-4">Tools & Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { Icon: Zap, title: 'A/B Testing', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setAbTestModal(true); } },
                    { Icon: Workflow, title: 'Workflows', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setAutomationModal(true); } },
                    { Icon: Mail, title: 'Email Content', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setEmailModal(true); } },
                    { Icon: Users, title: 'Recipients', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setRecipientModal(true); } },
                    { Icon: Link2, title: 'Integrations', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setIntegrationModal(true); } },
                    { Icon: Shield, title: 'Compliance', modal: () => { if (!campaigns.length) return; setSelectedCampaignId(campaigns[0]?.id || ''); setComplianceModal(true); } },
                  ].map((feature) => (
                    <button
                      key={feature.title}
                      onClick={feature.modal}
                      disabled={campaigns.length === 0}
                      className="group bg-white border border-[#E5E7EB] p-6 rounded-[2rem] text-left hover:border-[#1F2937] hover:shadow-[8px_8px_0px_0px_#FAFAF8] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-[#FAFAF8] rounded-[1rem] border border-[#E5E7EB] flex items-center justify-center mb-6 group-hover:bg-[#1F2937] group-hover:text-white transition-colors">
                        <feature.Icon className="w-6 h-6" />
                      </div>
                      <p className="text-[11px] font-black text-[#1F2937] uppercase tracking-widest">{feature.title}</p>
                    </button>
                  ))}
                </div>
             </div>

             <Card className="bg-[#1F2937] text-[#1F2937] p-12 rounded-[3.5rem] relative overflow-hidden h-[500px] flex flex-col justify-between shadow-[20px_20px_60px_rgba(0,0,0,0.1)]">
                <div className="relative z-10">
                   <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]">Premium Features</span>
                   </div>
                   <h3 className="text-4xl font-black leading-tight tracking-tight">Advanced Tools</h3>
                   <p className="text-[#4B5563] text-lg mt-6 leading-relaxed font-medium capitalize">Testing, scheduling, automation, and compliance tools to optimize your campaigns.</p>
                </div>
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-4 text-xs font-bold text-[#4B5563] mb-2 uppercase tracking-widest">
                      <div className="h-[1px] flex-1 bg-white/10" />
                      Ready to Use
                      <div className="h-[1px] flex-1 bg-white/10" />
                   </div>
                   <Button onClick={() => router.push('/dashboard/phase2-features')} className="w-full bg-[#1F2937] text-white font-extrabold text-[11px] uppercase tracking-[0.3em] h-16 rounded-[1.5rem] shadow-2xl cursor-pointer">Explore All Features</Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -translate-x-12 translate-y-24 rotate-45 rounded-[3rem] blur-2xl" />
             </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} campaignId={selectedCampaignId} onSave={handleScheduleSave} />
      <ABTestModal isOpen={abTestModal} onClose={() => setAbTestModal(false)} campaignId={selectedCampaignId} onSave={handleABTestSave} />
      <AutomationModal isOpen={automationModal} onClose={() => setAutomationModal(false)} campaignId={selectedCampaignId} onSave={handleAutomationSave} />
      <EmailContentModal isOpen={emailModal} onClose={() => setEmailModal(false)} campaignId={selectedCampaignId} onSave={handleEmailSave} />
      <RecipientModal isOpen={recipientModal} onClose={() => setRecipientModal(false)} campaignId={selectedCampaignId} onSave={handleRecipientSave} />
      <IntegrationModal isOpen={integrationModal} onClose={() => setIntegrationModal(false)} campaignId={selectedCampaignId} onSave={handleIntegrationSave} />
      <ComplianceModal isOpen={complianceModal} onClose={() => setComplianceModal(false)} campaignId={selectedCampaignId} onSave={handleComplianceSave} />
      <ApprovalModal isOpen={approvalModal} onClose={() => setApprovalModal(false)} campaignId={selectedCampaignId} onSave={handleApprovalSave} />

      {notification && (
        <div className={`fixed bottom-12 right-12 z-[1000] p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-2 animate-in slide-in-from-right-10 duration-500 bg-[#1F2937] text-white border-white/10`}>
          <div className="flex items-center gap-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
               {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">System Message</p>
               <p className="text-base font-bold tracking-tight">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
