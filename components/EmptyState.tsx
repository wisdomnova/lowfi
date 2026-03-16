'use client';

import { LucideIcon, Plus, SearchX } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  size?: 'sm' | 'md' | 'lg';
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState Component
 * 
 * Empty state display when no data is available.
 */
export default function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  size = 'lg',
  action,
}: EmptyStateProps) {
  const isSm = size === 'sm';
  const isMd = size === 'md';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${isSm ? 'py-10' : 'py-20'} px-4`}>
      <div className={`relative ${isSm ? 'mb-6' : 'mb-8'}`}>
        {/* Decorative Grid Background for Icon */}
        <div className={`absolute inset-0 bg-[#FAFAF8] rounded-[2.5rem] -rotate-6 scale-110 border-2 border-[#E5E7EB] border-dashed ${isSm ? 'hidden' : ''}`} />
        <div className={`relative ${isSm ? 'w-16 h-16' : 'w-24 h-24'} bg-white border-2 border-[#1F2937] ${isSm ? 'rounded-2xl' : 'rounded-[2.5rem]'} flex items-center justify-center shadow-[8px_8px_0px_0px_#FAFAF8]`}>
          <Icon className={`${isSm ? 'w-6 h-6' : 'w-10 h-10'} text-[#1F2937] stroke-[1.5]`} />
          
          {/* Status Badge */}
          <div className={`absolute -top-2 -right-2 bg-[#1F2937] text-white ${isSm ? 'text-[7px]' : 'text-[8px]'} font-black px-2 py-1 rounded-full uppercase tracking-widest border-2 border-white shadow-sm`}>
            {isSm ? 'None' : 'Pending'}
          </div>
        </div>
      </div>

      <div className={`${isSm ? 'space-y-1' : 'space-y-3'} mb-8`}>
        {!isSm && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAFAF8] rounded-full border border-[#E5E7EB] mb-2">
             <div className="w-1.5 h-1.5 bg-[#1F2937]/30 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">Attention</span>
          </div>
        )}
        <h3 className={`${isSm ? 'text-lg' : 'text-3xl'} font-black text-[#1F2937] tracking-tighter uppercase leading-none`}>
          {title}
        </h3>
        <p className={`${isSm ? 'text-xs' : 'text-sm'} text-[#6B7280] font-medium leading-relaxed max-w-xs mx-auto`}>
          {description}
        </p>
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          size={isSm ? 'sm' : 'lg'}
          className={isSm ? 'h-8' : 'h-12 px-8'}
        >
          <Plus className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
          {action.label}
        </Button>
      )}

      {!isSm && (
        <div className="mt-12 flex items-center gap-4 opacity-10">
          <div className="h-[1px] w-12 bg-[#1F2937]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#1F2937]">LowFi System</span>
          <div className="h-[1px] w-12 bg-[#1F2937]" />
        </div>
      )}
    </div>
  );
}
