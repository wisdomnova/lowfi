"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  Calendar,
  Search,
  Filter,
  History,
  ArrowRight,
  Clock,
  MoreVertical,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeleton";

interface FollowUp {
  id: string;
  customerId: string;
  draftEmail: string;
  status: "draft" | "sent" | "replied";
  createdAt: string;
}

export default function FollowUpHistory() {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/followups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch follow-ups');
      
      const data = await response.json();
      setFollowUps(data || []);
    } catch (error) {
      console.error("Error fetching follow-up history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFollowUps = () => {
    let filtered = followUps;
    
    if (statusFilter) {
      filtered = filtered.filter(f => f.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.customerId.toLowerCase().includes(query) || 
        f.draftEmail.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const filteredData = getFilteredFollowUps();

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/followups"
            className="w-10 h-10 bg-white border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center hover:border-slate-900 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Follow-ups</span>
             <ArrowRight className="w-3 h-3 text-slate-300" />
             <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Delivery History</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
               <History className="w-3 h-3 text-emerald-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Transmission Log</span>
            </div>
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
              History
            </h1>
            <p className="text-lg text-slate-500 font-medium">Tracking every follow-up transmission and status update.</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search - Matches Campaign Style */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white border border-[#E5E7EB] rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search history by recipient or content..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none p-0 text-[13px] font-black tracking-tight focus:ring-0 focus:outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="h-14 px-8 border border-[#E5E7EB] bg-white text-[#1F2937] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 hover:bg-[#FAFAF8] transition-all"
              >
                <Filter className="w-4 h-4" /> 
                {statusFilter ? statusFilter : 'All Statuses'}
              </button>
              
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {['all', 'draft', 'sent', 'replied'].map((status) => (
                      <button
                        key={status}
                        onClick={() => { 
                          setStatusFilter(status === 'all' ? null : status); 
                          setShowFilterMenu(false); 
                        }}
                        className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                          (status === 'all' && !statusFilter) || statusFilter === status
                            ? 'bg-[#1F2937] text-white' 
                            : 'text-[#1F2937] hover:bg-[#FAFAF8]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Follow-ups List */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="bg-white border-2 border-[#E5E7EB] border-dashed rounded-[3rem] p-4">
                <EmptyState 
                  icon={Mail}
                  title={searchQuery ? "No matches found" : "No History Yet"}
                  description={searchQuery ? "Try adjusting your search terms or filters." : "Your follow-up transmissions will appear here once you start sending."}
                  action={!searchQuery ? {
                    label: "Create Follow-up",
                    onClick: () => router.push('/dashboard/followups')
                  } : undefined}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredData.map((followUp) => (
                  <Card 
                    key={followUp.id} 
                    className="bg-white border-2 border-[#E5E7EB] rounded-[3rem] p-10 hover:border-[#1F2937] transition-all duration-500 group relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(0,0,0,0.01)]"
                  >
                    {/* Background ID Label */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                       <span className="text-8xl font-black italic">#{followUp.id.slice(-4)}</span>
                    </div>

                    <div className="flex flex-col h-full relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                            followUp.status === 'sent' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                            followUp.status === 'replied' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                            'bg-slate-50 border-slate-100 text-slate-400'
                          }`}>
                            {followUp.status === 'sent' ? <CheckCircle className="w-7 h-7" /> : 
                             followUp.status === 'replied' ? <MessageSquare className="w-7 h-7" /> : 
                             <Clock className="w-7 h-7" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Recipient ID</p>
                            <p className="text-base font-bold text-slate-900 tracking-tight">{followUp.customerId}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 shrink-0 ${
                          followUp.status === 'sent' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                          followUp.status === 'replied' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                          'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {followUp.status}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-2">
                            <div className="h-0.5 w-6 bg-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Email Payload</span>
                         </div>
                         <div className="p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2rem] relative group/content">
                            <p className="text-[13px] font-medium leading-relaxed text-slate-600 line-clamp-3 italic">
                              "{followUp.draftEmail}"
                            </p>
                            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/content:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                               <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl">View Content</button>
                            </div>
                         </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {new Date(followUp.createdAt).toLocaleDateString()} at {new Date(followUp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
