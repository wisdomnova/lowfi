'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Activity as ActivityIcon, 
  ArrowRight, 
  Calendar,
  Clock,
  User,
  Settings,
  FileText,
  Users,
  LogOut,
  Target,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  action_type: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout';
  resource_type: 'invoice' | 'follow_up' | 'ticket' | 'user' | 'settings' | 'team' | 'campaign';
  resource_id?: string;
  timestamp: string;
  details?: string;
}

export default function ActivityLogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [showResourceMenu, setShowResourceMenu] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/activity');

        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          throw new Error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'update':
        return <Settings className="w-5 h-5 text-blue-500" />;
      case 'delete':
        return <LogOut className="w-5 h-5 text-red-500" />;
      case 'login':
        return <User className="w-5 h-5 text-indigo-500" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;
    
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(a => a.resource_type === resourceFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.user_name.toLowerCase().includes(query) || 
        a.action.toLowerCase().includes(query) ||
        a.resource_type.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const filteredData = getFilteredActivities();

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center hover:border-slate-900 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dashboard</span>
             <ArrowRight className="w-3 h-3 text-slate-300" />
             <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Activity Log</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
               <ShieldCheck className="w-3 h-3 text-blue-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Audit Trail</span>
            </div>
            <h1 className="text-5xl font-black text-[#1F2937] tracking-tighter uppercase leading-none">
              Activity Log
            </h1>
            <p className="text-lg text-slate-500 font-medium tracking-tight">Tracking system-wide operations and user interactions.</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search - Standard High-Fi Styling */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white border border-[#E5E7EB] rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search log by user, resource or action..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none p-0 text-[13px] font-black focus:ring-0 focus:outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowResourceMenu(!showResourceMenu)}
                className="h-14 px-8 border border-[#E5E7EB] bg-white text-[#1F2937] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 hover:bg-[#FAFAF8] transition-all min-w-[200px] justify-between"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4" /> 
                  {resourceFilter === 'all' ? 'All Resources' : resourceFilter}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showResourceMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showResourceMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowResourceMenu(false)} />
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {['all', 'invoice', 'follow_up', 'ticket', 'campaign', 'user', 'team', 'settings'].map((res) => (
                      <button
                        key={res}
                        onClick={() => { 
                          setResourceFilter(res); 
                          setShowResourceMenu(false); 
                        }}
                        className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                          resourceFilter === res
                            ? 'bg-[#1F2937] text-white' 
                            : 'text-[#1F2937] hover:bg-[#FAFAF8]'
                        }`}
                      >
                        {res.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity List */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="bg-white border-2 border-[#E5E7EB] border-dashed rounded-[3rem] p-4">
                <EmptyState 
                  icon={ActivityIcon}
                  title={searchQuery || resourceFilter !== 'all' ? "No records found" : "No Activity Yet"}
                  description={searchQuery || resourceFilter !== 'all' ? "Try adjusting your search terms or filters." : "System activity records will appear here as you operate the platform."}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredData.map((activity) => (
                  <Card 
                    key={activity.id} 
                    className="bg-white border-2 border-[#E5E7EB] rounded-[3rem] p-10 hover:border-[#1F2937] transition-all duration-500 group relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(0,0,0,0.01)]"
                  >
                    {/* Background Visual Label */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                       <span className="text-8xl font-black italic uppercase">{activity.resource_type.slice(0, 3)}</span>
                    </div>

                    <div className="flex flex-col h-full relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-slate-50 border-slate-100`}>
                            {getActionIcon(activity.action_type)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Executor</p>
                            <p className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                               <User className="w-3.5 h-3.5 text-slate-300" />
                               {activity.user_name}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 bg-slate-50 border-slate-100 text-slate-400">
                          {activity.action_type}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-2">
                            <div className="h-0.5 w-6 bg-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Operation Details</span>
                         </div>
                         <div className="p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2rem]">
                            <p className="text-[13px] font-bold leading-relaxed text-slate-900">
                               {activity.action}
                            </p>
                            {activity.details && (
                               <p className="text-[11px] font-medium text-slate-500 mt-2 italic">
                                  {activity.details}
                                </p>
                            )}
                         </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Clock className="w-4 h-4 text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {new Date(activity.timestamp).toLocaleDateString()} — {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                           <Target className="w-3 h-3 text-slate-400" />
                           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{activity.resource_type}</span>
                        </div>
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



