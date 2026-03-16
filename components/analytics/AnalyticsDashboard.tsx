"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Activity, Radio, BarChart3, Globe, Tablet, TrendingUp } from "lucide-react";

interface AnalyticsData {
  daily: Array<{
    date: string;
    opens: number;
    clicks: number;
    bounces: number;
    conversions: number;
  }>;
  devices: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  geography: Array<{
    country: string;
    opens: number;
    clicks: number;
  }>;
  summary: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

interface AnalyticsDashboardProps {
  campaignId: string;
}

export function AnalyticsDashboard({ campaignId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `/api/campaigns/${campaignId}/detailed-analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const analyticsData = await res.json();
          setData(analyticsData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <Activity className="w-10 h-10 text-slate-900 animate-pulse" />
          <div className="absolute inset-0 bg-slate-900/10 blur-xl animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-16 text-center rounded-[3.5rem] border-2 border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
           <Radio className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">No Data Available</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">This campaign hasn't been sent yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sensor Array (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Emails Sent", value: data.summary.totalSent.toLocaleString(), icon: Radio, color: "text-slate-400" },
          { label: "Emails Opened", value: data.summary.totalOpened.toLocaleString(), rate: data.summary.openRate, icon: Activity, color: "text-emerald-500" },
          { label: "Clicks", value: data.summary.totalClicked.toLocaleString(), rate: data.summary.clickRate, icon: BarChart3, color: "text-blue-500" }
        ].map((sensor, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-[10px_10px_0px_0px_rgba(31,41,55,0.02)] group hover:border-slate-900 transition-all">
            <div className="flex justify-between items-start mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{sensor.label}</label>
              <sensor.icon className={`w-4 h-4 ${sensor.color}`} />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {sensor.value}
              </p>
              {sensor.rate !== undefined && (
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700`}>
                  {sensor.rate.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Telemetry Graph */}
      <div className="bg-white rounded-[3.5rem] border-2 border-[#E5E7EB] p-10 shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)]">
        <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">Performance Over Time</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily Metrics</span>
             </div>
          </div>
          <div className="hidden sm:flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opens</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clicks</span>
             </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: '2px solid #E2E8F0', 
                  boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.02)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              />
              <Line
                type="monotone"
                dataKey="opens"
                stroke="#10B981"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Opens"
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Sensor Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Cluster */}
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-10">
          <div className="flex items-center gap-3 mb-8">
            <Tablet className="w-5 h-5 text-slate-400" />
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Device Breakdown</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.devices}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#1F2937" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geo Cluster */}
        <div className="bg-[#1F2937] text-white rounded-[3rem] p-10 relative overflow-hidden">
          <Globe className="absolute top-0 right-0 w-48 h-48 opacity-5 -mr-12 -mt-12" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Top Regions</h3>
            </div>
            <div className="space-y-4">
              {data.geography.slice(0, 5).map((geo, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{geo.country}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{geo.opens} Opens</span>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{geo.clicks} Clicks</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                     <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
