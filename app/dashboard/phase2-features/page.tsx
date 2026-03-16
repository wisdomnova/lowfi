"use client";

import { useState } from "react";
import { Calendar, Zap, Workflow, Mail, Users, TrendingDown, Link2, Shield, CheckCircle, ArrowRight, Sparkles, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const FEATURES = [
  {
    Icon: Calendar,
    title: "Smart Scheduling",
    description: "Send campaigns at optimal times with timezone support and recurring schedules.",
    plan: "Professional",
    link: "/dashboard/campaigns",
  },
  {
    Icon: Zap,
    title: "A/B Testing",
    description: "Test subject lines and content variations to maximize engagement rates.",
    plan: "Professional",
    link: "/dashboard/campaigns",
  },
  {
    Icon: Workflow,
    title: "Campaign Automation",
    description: "Trigger campaigns based on user behavior and create automated workflows.",
    plan: "Professional",
    link: "/dashboard/campaigns",
  },
  {
    Icon: Mail,
    title: "Advanced Email Editor",
    description: "Build emails with rich text formatting, merge tags, and live preview.",
    plan: "Professional",
    link: "/dashboard/templates/create",
  },
  {
    Icon: Users,
    title: "Recipient Management",
    description: "Add recipients in bulk, create segments, and manage audiences.",
    plan: "Professional",
    link: "/dashboard/campaigns",
  },
  {
    Icon: TrendingDown,
    title: "Detailed Analytics",
    description: "Track opens, clicks, bounces with device and geographic breakdowns.",
    plan: "Professional",
    link: "/dashboard/reports",
  },
  {
    Icon: Link2,
    title: "Third-party Integrations",
    description: "Connect HubSpot, Salesforce, Slack, and Zapier with encrypted API keys.",
    plan: "Enterprise",
    link: "/dashboard/settings",
  },
  {
    Icon: Shield,
    title: "Deliverability Suite",
    description: "Verify SPF, DKIM, and DMARC records to maximize inbox placement.",
    plan: "Professional",
    link: "/dashboard/settings",
  },
  {
    Icon: CheckCircle,
    title: "Approval Workflows",
    description: "Set up review and approval processes before campaigns go live.",
    plan: "Professional",
    link: "/dashboard/campaigns",
  },
  {
    Icon: Users,
    title: "Team & Roles",
    description: "Manage team members with role-based access control and permissions.",
    plan: "Enterprise",
    link: "/dashboard/team",
  },
];

export default function Phase2FeaturesPage() {
  const [selectedPlan, setSelectedPlan] = useState("all");

  const filteredFeatures =
    selectedPlan === "all"
      ? FEATURES
      : FEATURES.filter((f) => f.plan.toLowerCase() === selectedPlan);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1F2937] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Features</h1>
            </div>
            <p className="text-[#6B7280] text-sm">
              Everything that powers your outreach — all 10 features, shipped and ready.
            </p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0">
            <span className="inline-flex items-center gap-2 px-8 py-3 bg-[#1F2937] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)] transition-all">
              View Plans <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_#1F2937] relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Features Shipped</p>
            <p className="text-4xl font-black text-[#1F2937] tracking-tight">10/10</p>
            <p className="text-xs text-[#6B7280] mt-1">All features live</p>
          </Card>
          <Card className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_#FAFAF8]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Professional</p>
            <p className="text-4xl font-black text-[#1F2937] tracking-tight">8</p>
            <p className="text-xs text-[#6B7280] mt-1">Available on Pro plan</p>
          </Card>
          <Card className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_#FAFAF8]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Enterprise</p>
            <p className="text-4xl font-black text-[#1F2937] tracking-tight">2</p>
            <p className="text-xs text-[#6B7280] mt-1">Enterprise-only features</p>
          </Card>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 border border-[#E5E7EB] rounded-2xl w-fit">
          {["all", "professional", "enterprise"].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                selectedPlan === plan
                  ? "bg-[#1F2937] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              {plan === "all" ? "All Features" : plan}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Link key={feature.title} href={feature.link}>
              <Card className="group bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_#FAFAF8] hover:shadow-[8px_8px_0px_0px_rgba(31,41,55,0.08)] hover:translate-y-[-2px] transition-all h-full cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl flex items-center justify-center group-hover:bg-[#1F2937] group-hover:border-[#1F2937] transition-all">
                    <feature.Icon className="w-6 h-6 text-[#1F2937] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1F2937] mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                    {feature.plan}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#1F2937] group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Feature Matrix */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#1F2937]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] tracking-tight">Feature Matrix</h2>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_0px_#FAFAF8]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAF8]">
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Feature</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Starter</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Professional</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr
                    key={feature.title}
                    className={`border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAFAF8]/50 transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFAF8]/30'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <feature.Icon className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-bold text-[#1F2937] text-xs uppercase tracking-wide">{feature.title}</span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-5">
                      <span className="text-[#D1D5DB]">—</span>
                    </td>
                    <td className="text-center px-4 py-5">
                      {feature.plan === "Professional" ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-50 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      ) : (
                        <span className="text-[#D1D5DB]">—</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-5">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-50 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2.5rem] p-12 shadow-[8px_8px_0px_0px_#1F2937] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-[#1F2937] tracking-tight">Built with APIs you can trust</h2>
              <p className="text-[#6B7280] text-sm max-w-lg">
                Every feature is backed by secure REST APIs with authentication, plan-based access control, real-time error handling, and full TypeScript support.
              </p>
            </div>
            <Link href="/dashboard/billing" className="shrink-0">
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#1F2937] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:translate-y-[-2px] hover:shadow-xl transition-all">
                Explore Plans <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
