"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/lib/toast";
import EmptyState from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/Skeleton";
import {
  FileText,
  Mail,
  Ticket,
  TrendingUp,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layout,
  History
} from "lucide-react";
import Link from "next/link";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";
import { Button } from "@/components/ui/Button";

interface Stats {
  invoices: number;
  followups: number;
  tickets: number;
  campaigns: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

const defaultChartData: ChartDataPoint[] = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const addToast = useToast((state) => state.addToast);
  const [stats, setStats] = useState<Stats>({
    invoices: 0,
    followups: 0,
    tickets: 0,
    campaigns: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>(defaultChartData);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'revenue' | 'volume'>('revenue');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');

        // Fetch chart metrics
        const metricsResponse = await fetch('/api/dashboard/metrics');

        if (statsResponse.ok && metricsResponse.ok) {
          const statsData = await statsResponse.json();
          const metricsData = await metricsResponse.json();
          
          setStats({
            invoices: statsData.invoices || 0,
            followups: statsData.followups || 0,
            tickets: statsData.tickets || 0,
            campaigns: statsData.campaigns || 0,
          });

          // Set initial chart data based on current tab
          if (chartTab === 'revenue') {
            setChartData(metricsData.revenue || defaultChartData);
          } else {
            setChartData(metricsData.volume || defaultChartData);
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast({
          type: "error",
          message: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, addToast, chartTab]);

  const handleExportData = async () => {
    try {
      if (!user) {
        addToast({
          type: "error",
          message: "Please sign in to export data",
        });
        return;
      }

      const response = await fetch('/api/dashboard/export');

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        addToast({
          type: "success",
          message: "Data exported successfully",
        });
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      addToast({
        type: "error",
        message: "Failed to export data",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-8 mb-10">
            <div className="space-y-4">
              <div className="h-10 w-48 bg-[#1F2937]/5 animate-pulse rounded-lg" />
              <div className="h-4 w-72 bg-[#1F2937]/5 animate-pulse rounded-lg" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-32 bg-[#1F2937]/5 animate-pulse rounded-xl" />
              <div className="h-12 w-40 bg-[#1F2937]/5 animate-pulse rounded-xl" />
            </div>
          </div>
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Dashboard</h1>
            <p className="text-[#6B7280] text-lg">View your key metrics and activity across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleExportData}
              variant="secondary" 
              size="lg"
              className="px-6"
            >
              Export Data
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/campaigns/create')}
              size="lg"
              className="px-6"
            >
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Invoices" 
            value={stats.invoices} 
            icon={FileText} 
            trend={stats.invoices > 0 ? "Active" : "None"} 
            isUp={true} 
            description="processing"
          />
          <StatCard 
            title="Active Follow-ups" 
            value={stats.followups} 
            icon={Mail} 
            trend={stats.followups > 0 ? "Active" : "None"} 
            isUp={true} 
            description="scheduled"
          />
          <StatCard 
            title="Support Tickets" 
            value={stats.tickets} 
            icon={Ticket} 
            trend={stats.tickets > 0 ? "Active" : "None"} 
            isUp={true} 
            description="open"
          />
          <StatCard 
            title="Live Campaigns" 
            value={stats.campaigns} 
            icon={Send} 
            trend={stats.campaigns > 0 ? "Active" : "None"} 
            isUp={true} 
            description="running"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 overflow-hidden border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-0">
            <div className="p-8 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1F2937]">Performance Trend</h3>
                <p className="text-sm text-[#6B7280]">Performance metrics over the last 7 days</p>
              </div>
              <div className="flex items-center gap-2 bg-[#FAFAF8] p-1 rounded-lg border border-[#E5E7EB]">
                 <button 
                   onClick={() => setChartTab('revenue')}
                   className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm cursor-pointer transition-all ${chartTab === 'revenue' ? 'bg-white text-[#1F2937]' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                 >
                   Revenue
                 </button>
                 <button 
                   onClick={() => setChartTab('volume')}
                   className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm cursor-pointer transition-all ${chartTab === 'volume' ? 'bg-white text-[#1F2937]' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                 >
                   Volume
                 </button>
              </div>
            </div>
            <div className="h-[400px] w-full p-8 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1F2937" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1F2937" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                    itemStyle={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1F2937" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8 space-y-8 flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-[#1F2937]">Active Channels</h3>
              <div className="space-y-6">
                {stats.campaigns > 0 && <ChannelItem name="Email Campaigns" progress={Math.min(100, stats.campaigns * 25)} color="bg-[#1F2937]" />}
                {stats.followups > 0 && <ChannelItem name="Follow-up Sequences" progress={Math.min(100, stats.followups * 25)} color="bg-[#1F2937]/60" />}
                {stats.invoices > 0 && <ChannelItem name="Invoice Processing" progress={Math.min(100, stats.invoices * 15)} color="bg-[#1F2937]/80" />}
                {stats.tickets > 0 && <ChannelItem name="Support Tickets" progress={Math.min(100, stats.tickets * 20)} color="bg-[#1F2937]/40" />}
                {(stats.campaigns + stats.followups + stats.invoices + stats.tickets) === 0 && (
                  <EmptyState 
                    size="sm"
                    title="No Data"
                    description="No active operations yet."
                    icon={Layout}
                    action={{
                      label: "Create",
                      onClick: () => router.push('/dashboard/campaigns/create')
                    }}
                  />
                )}
              </div>
            </div>
            
            <div className="pt-8 border-t border-[#E5E7EB]">
               <div className="bg-[#FAFAF8] rounded-2xl p-6 relative overflow-hidden border border-[#E5E7EB]">
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Active Items</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-3xl font-bold text-[#1F2937]">{stats.invoices + stats.followups + stats.campaigns + stats.tickets}</h4>
                      <span className="text-sm font-bold text-[#6B7280]">total</span>
                    </div>
                    <p className="text-sm text-[#6B7280] mt-2">Across all channels and operations</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#1F2937]/5 rounded-full blur-2xl" />
               </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section: Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-[#1F2937]">Activity</h3>
              <Link href="/dashboard/activity" className="text-xs font-bold text-[#1F2937] uppercase tracking-widest hover:underline">View Details</Link>
            </div>
            <div className="space-y-6">
              {(stats.invoices + stats.followups + stats.campaigns + stats.tickets) > 0 ? (
                <>
                  {stats.invoices > 0 && <ActivityItem icon={CheckCircle2} title={`${stats.invoices} invoice(s) to process`} time="Recently added" user="Invoicing" status="success" />}
                  {stats.followups > 0 && <ActivityItem icon={Mail} title={`${stats.followups} follow-up(s) scheduled`} time="Active" user="Follow-ups" status="pending" />}
                  {stats.campaigns > 0 && <ActivityItem icon={Send} title={`${stats.campaigns} campaign(s) running`} time="Active" user="Campaigns" status="success" />}
                  {stats.tickets > 0 && <ActivityItem icon={AlertCircle} title={`${stats.tickets} ticket(s) pending`} time="Open" user="Support" status="warning" />}
                </>
              ) : (
                <EmptyState 
                  size="sm"
                  title="No Activity"
                  description="Recent logs will appear here."
                  icon={History}
                />
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              title="Reconcile Invoices" 
              description="Extract and match data from incoming documents."
              icon={FileText}
              href="/dashboard/invoices"
            />
            <ActionCard 
              title="Automate Emails" 
              description="Configure intelligent follow-up sequences."
              icon={Mail}
              href="/dashboard/followups"
            />
            <ActionCard 
              title="Launch Campaign" 
              description="Broadcast to your segments with AI personalization."
              icon={Send}
              href="/dashboard/campaigns"
            />
            <ActionCard 
              title="Support Desk" 
              description="Manage support tickets and customer inquiries."
              icon={Ticket}
              href="/dashboard/tickets"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, isUp, description }: any) {
  return (
    <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-7 hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB]">
          <Icon className="w-6 h-6 text-[#1F2937]" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${isUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] leading-none mb-3">{title}</p>
        <h3 className="text-4xl font-bold text-[#1F2937] leading-none mb-3 tracking-tight">{value.toLocaleString()}</h3>
        <p className="text-xs text-[#6B7280] font-medium">{description}</p>
      </div>
    </Card>
  );
}

function ChannelItem({ name, progress, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-[#6B7280]">{name}</span>
        <span className="text-[#1F2937]">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, time, user, status }: any) {
  const statusClasses: Record<string, string> = {
    success: "text-green-500",
    pending: "text-blue-500",
    warning: "text-amber-500",
  };
  const statusColors = statusClasses[status] || "text-[#1F2937]/30";

  return (
    <div className="flex items-center gap-4 group cursor-pointer border-b border-[#F3F4F6] pb-5 last:border-0 last:pb-0">
      <div className={`p-2 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] ${statusColors}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#1F2937] truncate group-hover:text-[#1F2937]/70 transition-colors">{title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[#9CA3AF]">{time}</span>
          <span className="text-[11px] text-[#9CA3AF]">•</span>
          <span className="text-[11px] font-bold text-[#6B7280]">{user}</span>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, href }: any) {
  return (
    <Link href={href}>
      <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-6 hover:border-[#1F2937] transition-all duration-300 h-full group">
        <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] w-fit mb-5 group-hover:bg-[#1F2937] group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-[#1F2937] mb-2">{title}</h4>
        <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
      </Card>
    </Link>
  );
}
