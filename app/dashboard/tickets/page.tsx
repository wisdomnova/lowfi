"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Mail,
  User,
  Filter,
  Search,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  Send,
  Ticket
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import CreateTicketModal from "@/components/modals/CreateTicketModal";
import { useToast } from "@/lib/toast";

interface Ticket {
  id: string;
  userId: string;
  emailFrom: string;
  subject: string;
  body: string;
  category: string;
  status: "open" | "in_progress" | "resolved";
  aiResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Tickets() {
  const addToast = useToast((state) => state.addToast);
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('/api/tickets');

      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data || []);
      // Auto-select first ticket if none selected
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (data: { emailFrom: string; subject: string; body: string; category: string }) => {
    if (!user) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailFrom: data.emailFrom,
          subject: data.subject,
          body: data.body,
          category: data.category,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create ticket');
      }
      
      setShowCreateModal(false);
      fetchTickets();
      addToast({
        message: 'Support ticket created successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      addToast({
        message: 'Failed to create support ticket',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      fetchTickets();
      addToast({
        message: `Ticket status updated to ${newStatus.replace('_', ' ')}`,
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      addToast({
        message: 'Failed to update ticket status',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        throw new Error('Failed to send response');
      }

      // Clear form and refresh tickets
      setResponse("");
      setSelectedTicket(null);
      fetchTickets();
      addToast({
        message: 'Response sent successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending response:", error);
      addToast({
        message: 'Failed to send response. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <CheckCircle className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Resolved</span>
          </div>
        );
      case "in_progress":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
          </div>
        );
      case "open":
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            <AlertCircle className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Open</span>
          </div>
        );
    }
  };

  // Filter tickets based on selected status and search
  const filteredTickets = tickets
    .filter(ticket => filterStatus === "all" || ticket.status === filterStatus)
    .filter(ticket => !ticketSearch || 
      ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || 
      ticket.emailFrom.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.body.toLowerCase().includes(ticketSearch.toLowerCase())
    );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E5E7EB]">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">Support Tickets</h1>
            <p className="text-lg text-slate-500 font-medium tracking-tight">Manage and respond to customer support requests.</p>
          </div>
          <div className="flex items-center gap-4 relative">
             <div className="relative">
                <Button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  variant="secondary" 
                  size="lg"
                  className="h-12 px-8"
                >
                  <Filter className="w-4 h-4" /> Filter
                </Button>
                
                {showFilterMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-lg z-50 min-w-[200px] overflow-hidden">
                    {[
                      { label: 'All Tickets', value: 'all' },
                      { label: 'Open', value: 'open' },
                      { label: 'Active', value: 'in_progress' },
                      { label: 'Resolved', value: 'resolved' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value as any);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-6 py-4 border-b border-[#F3F4F6] last:border-b-0 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                          filterStatus === option.value
                            ? 'bg-[#1F2937] text-white'
                            : 'hover:bg-[#FAFAF8]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
             </div>
             <Button onClick={() => setShowCreateModal(true)} size="lg" className="h-12 px-10">
               <Plus className="w-4 h-4" /> Create Ticket
             </Button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
          {/* Sidebar: Ticket List */}
          <div className="lg:col-span-4 flex flex-col h-full overflow-hidden space-y-6">
             <div className="flex items-center gap-3 px-3 py-2 bg-white border-2 border-[#E5E7EB] rounded-2xl transition-all focus-within:border-[#1F2937] group h-16">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                 <Search className="w-4 h-4" />
               </div>
               <input 
                 type="text" 
                 placeholder="Search tickets..." 
                 value={ticketSearch}
                 onChange={(e) => setTicketSearch(e.target.value)}
                 className="flex-1 bg-transparent border-none p-0 text-xs font-black focus:outline-none placeholder:text-gray-400"
               />
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-6">
               {loading ? (
                 <>
                   <div className="p-8 rounded-[3rem] border-2 border-[#1F2937]/5 bg-[#FAFAF8] space-y-4">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-3 w-48" />
                   </div>
                   <div className="p-8 rounded-[3rem] border-2 border-[#1F2937]/5 bg-[#FAFAF8] space-y-4">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-3 w-48" />
                   </div>
                   <div className="p-8 rounded-[3rem] border-2 border-[#1F2937]/5 bg-[#FAFAF8] space-y-4">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-3 w-48" />
                   </div>
                 </>
               ) : filteredTickets.length === 0 ? (
                 <EmptyState 
                   size="sm"
                   title={filterStatus !== "all" ? "No matches" : "Empty Desk"}
                   description={filterStatus !== "all" ? `No ${filterStatus} tickets found.` : "Your support queue is empty!"}
                   icon={Ticket}
                 />
               ) : (
                 filteredTickets.map((ticket) => (
                   <button
                     key={ticket.id}
                     onClick={() => setSelectedTicket(ticket)}
                     className={`w-full text-left p-8 rounded-[3rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                       selectedTicket?.id === ticket.id 
                       ? 'bg-[#1F2937] border-[#1F2937] shadow-[12px_12px_40px_rgba(31,41,55,0.15)] translate-y-[-4px]' 
                       : 'bg-white border-[#E5E7EB] hover:border-[#1F2937]/30 hover:shadow-lg'
                     }`}
                   >
                     <div className="flex items-center justify-between gap-4 mb-5 relative z-10">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                          selectedTicket?.id === ticket.id 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-[#FAFAF8] border-[#E5E7EB] text-[#9CA3AF]'
                        }`}>
                          {ticket.category}
                        </span>
                        {getStatusBadge(ticket.status)}
                     </div>
                     <h3 className={`text-base font-bold mb-3 truncate relative z-10 ${
                       selectedTicket?.id === ticket.id ? 'text-white' : 'text-[#1F2937]'
                     }`}>
                       {ticket.subject}
                     </h3>
                     <div className="flex items-center justify-between gap-4 relative z-10">
                        <p className={`text-[10px] font-mono tracking-tighter truncate ${
                          selectedTicket?.id === ticket.id ? 'text-white/60' : 'text-[#6B7280]'
                        }`}>
                          {ticket.emailFrom}
                        </p>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${
                          selectedTicket?.id === ticket.id ? 'text-white translate-x-2' : 'text-[#CED4DA]'
                        }`} />
                     </div>
                     {selectedTicket?.id === ticket.id && (
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                     )}
                   </button>
                 ))
               )}
             </div>
          </div>

          {/* Main Area: Ticket Detail */}
          <div className="lg:col-span-8 h-full min-h-0">
             {selectedTicket ? (
               <Card className="h-full flex flex-col bg-white border border-[#E5E7EB] rounded-[3.5rem] overflow-hidden shadow-[8px_8px_0px_0px_#FAFAF8]">
                  {/* Detail Header */}
                  <div className="p-10 border-b border-[#F3F4F6] flex items-center justify-between bg-[#FAFAF8]/30">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-[#E5E7EB] shadow-sm transform rotate-[-2deg]">
                           <User className="w-8 h-8 text-[#1F2937]" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-1">Customer Message</p>
                           <h2 className="text-xl font-bold text-[#1F2937] leading-tight tracking-tight">{selectedTicket.subject}</h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => { if (selectedTicket) handleStatusChange(selectedTicket.id, selectedTicket.status === 'resolved' ? 'new' : 'resolved'); }} className="w-12 h-12 flex items-center justify-center bg-white border border-[#E5E7EB] text-[#6B7280] rounded-xl transition-all shadow-sm hover:bg-[#FAFAF8] cursor-pointer" title={selectedTicket.status === 'resolved' ? 'Reopen' : 'Resolve'}>
                           <MoreVertical className="w-5 h-5" />
                        </button>
                     </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                     {/* Client Message */}
                     <div className="flex gap-8 max-w-4xl">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                           <Mail className="w-5 h-5 text-[#1F2937]" />
                        </div>
                        <div className="space-y-4 pt-2">
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.3em]">Customer Email</span>
                              <div className="h-px w-8 bg-[#E5E7EB]" />
                              <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                           </div>
                           <div className="p-10 bg-[#FAFAF8] border-2 border-[#E5E7EB] rounded-[3rem] rounded-tl-none relative shadow-sm">
                              <p className="text-sm text-[#1F2937] leading-relaxed font-medium">
                                "{selectedTicket.body}"
                              </p>
                              <div className="absolute top-0 left-0 w-8 h-8 bg-[#FAFAF8] border-l-2 border-t-2 border-[#E5E7EB] -translate-x-full" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
                           </div>
                        </div>
                     </div>

                     {/* AI Synthesis (if exists) */}
                     {selectedTicket.aiResponse && (
                        <div className="ml-20 bg-[#1F2937] p-10 rounded-[3rem] relative overflow-hidden shadow-[12px_12px_40px_rgba(31,41,55,0.1)]">
                           <div className="relative z-10 space-y-6">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white/10 rounded-xl">
                                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                                 </div>
                                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Suggestion</span>
                              </div>
                              <p className="text-base text-white/90 leading-relaxed font-bold italic border-l-4 border-amber-400/50 pl-6 py-2">
                                 {selectedTicket.aiResponse}
                              </p>
                              <div className="pt-4 flex gap-4">
                                 <button 
                                    onClick={() => setResponse(selectedTicket.aiResponse || "")}
                                    className="h-12 px-6 bg-white text-[#1F2937] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 hover:text-[#1F2937] transition-all shadow-lg active:translate-y-1"
                                 >
                                    Use Suggestion
                                 </button>
                                 <button 
                                    onClick={() => setResponse(selectedTicket.aiResponse || "")}
                                    className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                 >
                                    Edit Response
                                 </button>
                              </div>
                           </div>
                           <Zap className="absolute top-0 right-0 w-48 h-48 text-white/5 -rotate-12 translate-x-12 opacity-20" />
                        </div>
                     )}
                  </div>

                  {/* Response Input */}
                  <div className="p-10 bg-[#FAFAF8]/30 border-t border-[#F3F4F6]">
                     <div className="relative bg-white border-2 border-[#E5E7EB] rounded-[2.5rem] p-4 focus-within:border-[#1F2937] focus-within:shadow-[10px_10px_30px_rgba(0,0,0,0.05)] transition-all duration-500">
                        <textarea 
                          placeholder="Type your response..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          className="w-full h-44 p-6 bg-transparent resize-none text-base font-medium focus:outline-none text-[#1F2937]"
                        />
                        <div className="flex items-center justify-between py-4 px-6 border-t border-[#F3F4F6]">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Ready to send</span>
                           </div>
                           <button 
                              onClick={handleSendResponse}
                              disabled={!response.trim()}
                              className="h-14 px-10 bg-[#1F2937] text-white rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)] disabled:opacity-30 disabled:shadow-none translate-y-[-2px] active:translate-y-0 active:shadow-none"
                           >
                              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Send Response</span>
                              <Send className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </Card>
             ) : (
               <div className="h-full flex flex-col items-center justify-center p-24 bg-[#FAFAF8]/50 border-2 border-dashed border-[#E5E7EB] rounded-[4rem] group hover:bg-white transition-all duration-700">
                  <div className="w-24 h-24 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-700">
                     <MessageSquare className="w-10 h-10 text-[#CED4DA] group-hover:text-[#1F2937]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1F2937]">No Ticket Selected</h3>
                  <p className="text-[#9CA3AF] text-base mt-2 font-medium max-w-[240px] text-center">Select a ticket from the list to view details and respond.</p>
               </div>
             )}
          </div>
        </div>
      </div>
      <CreateTicketModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTicket}
        isLoading={isCreating}
      />
    </DashboardLayout>
  );
}
