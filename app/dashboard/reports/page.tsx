'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/lib/toast';
import { Skeleton } from '@/components/Skeleton';
import { Download, FileText, Layout, Calendar, Mail, Eye, Pointer, MessageSquare } from 'lucide-react';

interface CampaignMetrics {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
  averageOpenRate: number;
  averageClickRate: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    sentCount: number;
    openedCount: number;
    clickedCount: number;
  }>;
}

interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'invoice' | 'followup' | 'ticket' | 'campaign' | 'summary';
}

export default function ReportsPage() {
  const addToast = useToast((state) => state.addToast);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [isExporting, setIsExporting] = useState(false);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    fetchCampaignMetrics();
  }, [dateRange]);

  async function fetchCampaignMetrics() {
    try {
      setMetricsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/campaigns/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaignMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaign metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  }

  const reports: Report[] = [
    {
      id: '1',
      name: 'Campaign Performance',
      description: 'Campaign sending metrics, engagement rates, and performance analysis',
      icon: <Mail className="w-6 h-6" />,
      type: 'campaign',
    },
    {
      id: '2',
      name: 'Invoice Summary',
      description: 'Summary of all invoices processed, amounts, and status',
      icon: <FileText className="w-6 h-6" />,
      type: 'invoice',
    },
    {
      id: '3',
      name: 'Follow-up Activity',
      description: 'Report on follow-up emails sent and engagement metrics',
      icon: <Layout className="w-6 h-6" />,
      type: 'followup',
    },
    {
      id: '4',
      name: 'Support Tickets',
      description: 'Ticket statistics including resolution time and categories',
      icon: <FileText className="w-6 h-6" />,
      type: 'ticket',
    },
    {
      id: '5',
      name: 'Operations Summary',
      description: 'Comprehensive overview of all operations and metrics',
      icon: <Layout className="w-6 h-6" />,
      type: 'summary',
    },
  ];

  const handleExport = async (format: 'pdf' | 'csv', reportType: string) => {
    setIsExporting(true);
    try {
      if (format === 'csv' && campaignMetrics) {
        let csvContent = '';
        
        if (reportType === 'campaign') {
          csvContent = 'Campaign,Sent,Opened,Clicked\n';
          campaignMetrics.topCampaigns.forEach(c => {
            csvContent += `"${c.name}",${c.sentCount},${c.openedCount},${c.clickedCount}\n`;
          });
          csvContent += `\nTotal Campaigns,${campaignMetrics.totalCampaigns}\nTotal Sent,${campaignMetrics.totalSent}\nAvg Open Rate,${campaignMetrics.averageOpenRate.toFixed(1)}%\nAvg Click Rate,${campaignMetrics.averageClickRate.toFixed(1)}%\n`;
        } else {
          csvContent = `Report Type,${reportType}\nDate Range,${dateRange.startDate} to ${dateRange.endDate}\nTotal Campaigns,${campaignMetrics.totalCampaigns}\nTotal Sent,${campaignMetrics.totalSent}\nTotal Opened,${campaignMetrics.totalOpened}\nTotal Clicked,${campaignMetrics.totalClicked}\nTotal Replied,${campaignMetrics.totalReplied}\nAvg Open Rate,${campaignMetrics.averageOpenRate.toFixed(1)}%\nAvg Click Rate,${campaignMetrics.averageClickRate.toFixed(1)}%\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lowfi-${reportType}-report-${dateRange.startDate}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        addToast({ message: `${reportType} report exported as CSV`, type: 'success', duration: 3000 });
      } else if (format === 'pdf') {
        addToast({ message: `PDF export coming soon — use CSV for now`, type: 'info', duration: 3000 });
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        message: 'Failed to export report',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-10 space-y-12 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1F2937]/5 pb-10 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#1F2937]/20" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1F2937]/40">Reports</span>
            </div>
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight focus:outline-none">
              Reports
            </h1>
            <p className="text-[#1F2937]/50 font-medium mt-1">
              View and export your campaign and business reports.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 p-2 rounded-2xl border border-[#1F2937]/5">
             <div className="flex items-center gap-3 px-4">
                <Calendar className="w-4 h-4 text-[#1F2937]/30" />
                <div className="flex items-center gap-2">
                   <input
                     type="date"
                     value={dateRange.startDate}
                     onChange={(e) => setDateRange(p => ({...p, startDate: e.target.value}))}
                     className="bg-transparent text-[11px] font-bold text-[#1F2937] uppercase tracking-wider focus:outline-none cursor-pointer"
                   />
                   <span className="text-[#1F2937]/20">—</span>
                   <input
                     type="date"
                     value={dateRange.endDate}
                     onChange={(e) => setDateRange(p => ({...p, endDate: e.target.value}))}
                     className="bg-transparent text-[11px] font-bold text-[#1F2937] uppercase tracking-wider focus:outline-none cursor-pointer"
                   />
                </div>
             </div>
             <Button onClick={() => fetchCampaignMetrics()} size="md" className="h-10 px-6">
                Update Range
             </Button>
          </div>
        </div>

        {/* Metrics */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#1F2937]/5 rounded-[2rem] p-8 space-y-4">
                <Skeleton className="h-4 w-4 rounded-lg" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : campaignMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: 'Total Campaigns', val: campaignMetrics.totalCampaigns, icon: Layout },
              { label: 'Total Sent', val: campaignMetrics.totalSent.toLocaleString(), icon: Mail },
              { label: 'Average Open Rate', val: `${campaignMetrics.averageOpenRate.toFixed(1)}%`, icon: Eye, color: 'text-blue-500' },
              { label: 'Average Click Rate', val: `${campaignMetrics.averageClickRate.toFixed(1)}%`, icon: Pointer, color: 'text-emerald-500' },
              { label: 'Total Replies', val: campaignMetrics.totalReplied, icon: MessageSquare, color: 'text-purple-500' },
            ].map((metric, i) => (
              <div key={i} className="bg-white border border-[#1F2937]/5 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group hover:border-[#1F2937]/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-[#FAFAF8] ${metric.color || 'text-[#1F2937]/40'}`}>
                    <metric.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F2937]/30 mb-1">{metric.label}</p>
                <div className="text-3xl font-bold text-[#1F2937] tabular-nums tracking-tighter">
                  {metric.val}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
           {/* Left column: Reports List */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F2937]/40">Available Reports</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between hover:border-[#1F2937]/10 transition-all">
                    <div>
                      <div className="w-14 h-14 bg-[#FAFAF8] rounded-2xl flex items-center justify-center mb-6 text-[#1F2937] shadow-inner">
                        {report.icon}
                      </div>
                      <h3 className="text-lg font-bold text-[#1F2937] mb-2">{report.name}</h3>
                      <p className="text-sm font-medium text-[#1F2937]/50 leading-relaxed min-h-[4rem]">
                        {report.description}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-8 mt-4 border-t border-[#1F2937]/5">
                      <button
                        onClick={() => handleExport('pdf', report.type)}
                        disabled={isExporting}
                        className="flex-1 h-12 flex items-center justify-center gap-2 border border-[#1F2937]/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1F2937] hover:bg-[#FAFAF8] transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => handleExport('csv', report.type)}
                        disabled={isExporting}
                        className="flex-1 h-12 flex items-center justify-center gap-2 border border-[#1F2937]/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1F2937] hover:bg-[#FAFAF8] transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Top Campaigns */}
           <div className="space-y-6">
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F2937]/40">Top Campaigns</h2>
              </div>
              <div className="bg-[#1F2937] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#1F2937]/20">
                 {metricsLoading ? (
                    <div className="space-y-8">
                       {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between">
                                <Skeleton className="h-4 w-32 bg-white/10" />
                                <Skeleton className="h-3 w-8 bg-white/10" />
                             </div>
                             <Skeleton className="h-1.5 w-full bg-white/10 rounded-full" />
                             <div className="flex justify-between">
                                <Skeleton className="h-3 w-16 bg-white/10" />
                                <Skeleton className="h-3 w-12 bg-white/10" />
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : campaignMetrics && campaignMetrics.topCampaigns.length > 0 ? (
                    <div className="space-y-8">
                       {campaignMetrics.topCampaigns.map((campaign, idx) => (
                          <div key={campaign.id} className="group cursor-default">
                             <div className="flex justify-between items-end mb-3">
                                <span className="text-xs font-bold truncate max-w-[150px]">{campaign.name}</span>
                                <span className="text-[10px] font-bold text-white/40 tabular-nums">#{(idx+1)}</span>
                             </div>
                             <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                  style={{ width: `${(campaign.openedCount / campaign.sentCount) * 100}%` }}
                                />
                             </div>
                             <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                <span>{campaign.sentCount} SENT</span>
                                <span className="text-emerald-500">{((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)}% OPEN</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-12">
                       <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">No campaigns yet</p>
                    </div>
                 )}
                 
                 <div className="mt-12 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">
                      Reports are updated in real-time. Adjust the date range above to view historical data.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
