"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Calendar,
  Zap,
  ChevronRight,
  Sparkles,
  History as HistoryIcon
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeleton";

interface FollowUp {
  id: string;
  customerId: string;
  draftEmail: string;
  status: "draft" | "sent" | "replied";
  createdAt: string;
}

export default function FollowUps() {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    customerId: "",
    draftEmail: "",
  });

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const res = await fetch('/api/followups');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFollowUps(data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.draftEmail) return;

    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId,
          draftEmail: formData.draftEmail,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      setFormData({ customerId: "", draftEmail: "" });
      setShowForm(false);
      fetchFollowUps();
    } catch (error) {
      console.error("Error creating follow-up:", error);
    }
  };

  const handleStatusUpdate = async (id: string, status: "sent" | "replied") => {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchFollowUps();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getFilteredFollowUps = () => {
    let filtered = followUps;
    if (statusFilter) filtered = filtered.filter(f => f.status === statusFilter);
    if (searchQuery) filtered = filtered.filter(f => 
      f.customerId.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.draftEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered;
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header Section */} 
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
               <Zap className="w-3 h-3 text-emerald-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Outreach</span>
            </div>
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
              Follow-ups
            </h1>
            <p className="text-lg text-slate-500 font-medium">Manage customer follow-ups and automated outreach.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="secondary" 
               size="lg"
               onClick={() => router.push("/dashboard/followups/history")} 
               className="h-12 px-8"
             >
               <HistoryIcon className="w-4 h-4" /> History
             </Button>
             <Button 
               onClick={() => setShowForm(!showForm)}
               size="lg"
               className="h-12 px-10"
             >
               {showForm ? <ArrowLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
               {showForm ? "Cancel" : "New Follow-up"}
             </Button>
          </div>
        </div>

        {showForm ? (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white border-2 border-[#E5E7EB] rounded-[3.5rem] p-16 relative overflow-hidden shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)]">
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-12">
                   <div className="w-16 h-16 bg-[#FAFAF8] border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0">
                      <Zap className="w-8 h-8 text-[#1F2937]" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">New Follow-up</h2>
                      <p className="text-slate-500 text-lg font-medium mt-1">Compose and send a follow-up email to a customer.</p>
                   </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">Customer Email</label>
                    <div className="flex items-center bg-white border border-[#E5E7EB] rounded-2xl h-16 transition-all focus-within:border-[#1F2937] group mx-1">
                      <input
                        type="email"
                        placeholder="customer@example.com"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="flex-1 bg-transparent border-none px-6 font-black text-base tracking-tight outline-none focus:ring-0 placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Content</label>
                       <button 
                         type="button" 
                         onClick={() => {
                           setFormData(prev => ({ ...prev, draftEmail: `Hi there,\n\nI wanted to follow up regarding our previous conversation. ${prev.draftEmail ? 'As mentioned, ' + prev.draftEmail : ''}\n\nWould love to reconnect and discuss next steps.\n\nBest regards` }));
                         }} 
                         className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 rounded-lg flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all shadow-sm cursor-pointer"
                       >
                         <Sparkles className="w-3.5 h-3.5" /> AI Personalize
                       </button>
                    </div>
                    <div className="mx-1 border border-[#E5E7EB] rounded-[2rem] bg-white overflow-hidden transition-all focus-within:border-[#1F2937]">
                      <textarea
                        placeholder="Enter your follow-up email message..."
                        value={formData.draftEmail}
                        onChange={(e) => setFormData({ ...formData, draftEmail: e.target.value })}
                        className="w-full px-10 py-8 bg-transparent text-[#1F2937] placeholder:text-slate-300 focus:outline-none font-black leading-relaxed resize-none min-h-[350px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-[#1F2937] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[8px_8px_0px_0px_rgba(31,41,55,0.1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_30px_0px_rgba(31,41,55,0.15)] transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Send Follow-up
                    </Button>
                  </div>
                </form>
              </div>
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
                <Mail className="w-80 h-80 rotate-12" />
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
             {/* Search & Filter Dock */}
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                   <div className="flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-2xl transition-all focus-within:border-[#1F2937] group h-14">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                       <Search className="w-4 h-4" />
                     </div>
                     <input
                       type="text"
                       placeholder="Search follow-ups..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="flex-1 bg-transparent border-none p-0 text-sm font-black focus:ring-0 focus:outline-none placeholder:text-gray-400"
                     />
                   </div>
                </div>
                <div className="relative">
                  <Button variant="secondary" onClick={() => setShowFilterMenu(!showFilterMenu)} className="h-14 px-8 border-[#E5E7EB] bg-white text-[#1F2937] font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 cursor-pointer">
                     <Filter className="w-4 h-4" /> {statusFilter ? statusFilter : 'Filter Status'}
                  </Button>
                  {showFilterMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg z-10">
                      <button
                        onClick={() => { setStatusFilter(null); setShowFilterMenu(false); }}
                        className={`w-full text-left px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${!statusFilter ? 'bg-[#1F2937] text-white' : 'text-[#1F2937] hover:bg-[#FAFAF8]'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => { setStatusFilter('draft'); setShowFilterMenu(false); }}
                        className={`w-full text-left px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${statusFilter === 'draft' ? 'bg-[#1F2937] text-white' : 'text-[#1F2937] hover:bg-[#FAFAF8]'}`}
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => { setStatusFilter('sent'); setShowFilterMenu(false); }}
                        className={`w-full text-left px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${statusFilter === 'sent' ? 'bg-[#1F2937] text-white' : 'text-[#1F2937] hover:bg-[#FAFAF8]'}`}
                      >
                        Sent
                      </button>
                      <button
                        onClick={() => { setStatusFilter('replied'); setShowFilterMenu(false); }}
                        className={`w-full text-left px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${statusFilter === 'replied' ? 'bg-[#1F2937] text-white' : 'text-[#1F2937] hover:bg-[#FAFAF8]'}`}
                      >
                        Replied
                      </button>
                    </div>
                  )}
                </div>
             </div>

             {/* Follow-ups List */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {loading ? (
                   <>
                     <CardSkeleton />
                     <CardSkeleton />
                     <CardSkeleton />
                     <CardSkeleton />
                   </>
                ) : getFilteredFollowUps().length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState 
                      title="No Follow-ups"
                      description={statusFilter ? `No ${statusFilter} follow-ups found.` : 'Create your first follow-up to get started.'}
                      icon={Mail}
                      action={!statusFilter ? {
                        label: "New Follow-up",
                        onClick: () => setShowForm(true)
                      } : undefined}
                    />
                  </div>
                   ) : (
                  getFilteredFollowUps().map((followUp) => (
                    <Card key={followUp.id} className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 hover:border-[#1F2937] transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-8">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              followUp.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 
                              followUp.status === 'replied' ? 'bg-blue-50 text-blue-600' : 
                              'bg-[#FAFAF8] text-[#9CA3AF]'
                            }`}>
                               {followUp.status === 'sent' ? <CheckCircle className="w-6 h-6" /> : followUp.status === 'replied' ? <CheckCircle className="w-6 h-6 text-blue-600" /> : <Mail className="w-6 h-6" />}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Recipient</p>
                               <p className="text-sm font-bold text-[#1F2937]">{followUp.customerId}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           followUp.status === 'sent' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                           followUp.status === 'replied' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                           'bg-[#FAFAF8] border-[#E5E7EB] text-[#9CA3AF]'
                         }`}>
                           {followUp.status === 'draft' ? 'Draft' : followUp.status === 'sent' ? 'Sent' : 'Replied'}
                         </div>
                      </div>

                      <div className="mb-8">
                         <h3 className="text-lg font-bold text-[#1F2937] mb-3 group-hover:text-[#1F2937]/70 transition-colors line-clamp-2">Email Content</h3>
                         <div className="p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl italic text-xs leading-relaxed text-[#6B7280]">
                            "{followUp.draftEmail.length > 150 ? followUp.draftEmail.substring(0, 150) + "..." : followUp.draftEmail}"
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-[#F3F4F6]">
                         <span className="text-[10px] font-bold text-[#9CA3AF] uppercase flex items-center gap-2">
                           <Calendar className="w-3 h-3" /> {new Date(followUp.createdAt).toLocaleDateString()}
                         </span>
                         
                         {followUp.status === "draft" && (
                           <div className="flex gap-2">
                              <button 
                                onClick={() => handleStatusUpdate(followUp.id, "sent")}
                                className="h-10 px-5 bg-[#1F2937] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" /> Send
                              </button>
                           </div>
                         )}

                         {followUp.status !== "draft" && (
                            <button onClick={() => router.push('/dashboard/followups/history')} className="text-[10px] font-black text-[#1F2937] uppercase tracking-widest flex items-center gap-2 hover:opacity-70">
                               View Analytics <ChevronRight className="w-3 h-3" />
                            </button>
                         )}
                      </div>
                    </Card>
                  ))
                )}
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
function History({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="m12 7 0 5 3 3" />
    </svg>
  );
}
