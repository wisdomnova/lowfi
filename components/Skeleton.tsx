'use client';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton Component
 * 
 * Animated skeleton loader for displaying while content is loading
 */
export function Skeleton({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-[#1F2937]/5 animate-pulse rounded-lg ${className} ${i > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </>
  );
}

/**
 * CardSkeleton Component
 * 
 * Skeleton for card layouts
 */
export function CardSkeleton() {
  return (
    <div className="bg-[#FAFAF8] rounded-[2.5rem] border-2 border-[#1F2937]/10 p-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" count={3} />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-12 w-24 rounded-2xl" />
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * TableSkeleton Component
 * 
 * Skeleton for table layouts
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-6 border-2 border-[#1F2937]/5 rounded-[2rem] bg-white">
          <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32 opacity-50" />
          </div>
          <Skeleton className="h-12 w-24 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton Component
 * 
 * Skeleton for the main dashboard view
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-[2rem] p-7 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[2rem] p-8 h-[500px]">
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-full w-full rounded-2xl opacity-20" />
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[2rem] p-8 space-y-8">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-[#E5E7EB]">
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LoadingSpinner Component
 * 
 * Spinner for loading states
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-[#1F2937]/10 border-t-[#1F2937] rounded-full animate-spin`} />
    </div>
  );
}
