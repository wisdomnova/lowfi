import { AlertCircle, Lock, Zap, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface PlanLimitAlertProps {
  type: 'limit-reached' | 'feature-locked' | 'upgrade-suggested';
  message: string;
  currentUsage?: number;
  limit?: number;
  onUpgradeClick?: () => void;
}

/**
 * PlanLimitAlert
 * 
 * Alert message when approaching plan limits.
 */
export function PlanLimitAlert({
  type,
  message,
  currentUsage,
  limit,
  onUpgradeClick,
}: PlanLimitAlertProps) {
  const isLocked = type === 'feature-locked';
  const Icon = isLocked ? Lock : Shield;

  return (
    <div className={`relative overflow-hidden border-2 rounded-[2.5rem] p-8 mb-8 transition-all bg-white border-[#E5E7EB] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.03)]`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Activity className="w-12 h-12" />
      </div>
      
      <div className="flex items-start gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLocked ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
          <Icon className="w-7 h-7" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Plan Limit</span>
          </div>

          <p className="text-xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            {message}
          </p>

          {currentUsage !== undefined && limit !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usage</span>
                <span className="text-[10px] font-black text-slate-900">{Math.round((currentUsage/limit) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 transition-all duration-1000" 
                  style={{ width: `${(currentUsage / limit) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {currentUsage} / {limit}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Link href="/dashboard/billing">
              <Button
                variant="primary"
                onClick={onUpgradeClick}
                className="h-12 px-6 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PlanBadge
 * 
 * Plan tier badge.
 */
export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-[9px]',
    md: 'px-4 py-1.5 text-[10px]',
    lg: 'px-5 py-2 text-[11px]',
  };

  const planStyles: Record<string, string> = {
    starter: 'bg-slate-100 text-slate-600 border-slate-200',
    professional: 'bg-slate-900 text-white border-slate-900',
    enterprise: 'bg-blue-600 text-white border-blue-600',
  };

  const lowerPlan = plan.toLowerCase();

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-[0.15em] rounded-full border-2 ${sizeClasses[size]} ${
        planStyles[lowerPlan] || planStyles.starter
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${lowerPlan === 'professional' ? 'bg-blue-400' : 'bg-current opacity-40'}`} />
      {plan}
    </span>
  );
}

interface PlanFeatureListProps {
  features: string[];
  size?: 'sm' | 'md';
}

/**
 * PlanFeatureList
 * 
 * Feature list for plan tiers.
 */
export function PlanFeatureList({ features, size = 'md' }: PlanFeatureListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-center gap-4 group">
          <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Zap className="w-3 h-3" />
          </div>
          <span className={`font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'}`}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}
