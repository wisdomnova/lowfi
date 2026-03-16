"use client";

import { X, CheckCircle, AlertCircle, Info, Zap } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    description?: string;
    duration?: number;
  };
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const statusColors = {
    success: "bg-emerald-500",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-amber-500",
  }[toast.type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: Zap,
  }[toast.type];

  return (
    <div
      className="bg-[#1F2937] border-2 border-white/10 rounded-[2.5rem] p-8 min-w-[380px] pointer-events-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-5 duration-500 relative overflow-hidden"
    >
      <div className="flex items-center gap-6 relative z-10">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 ${statusColors} text-white shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="text-lg font-bold text-white tracking-tight leading-tight">{toast.message}</p>
          {toast.description && (
            <p className="text-sm text-white/60 font-medium">
              {toast.description}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div 
          className={`h-full ${statusColors} animate-progress`} 
          style={{ animationDuration: `${toast.duration || 4000}ms` }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation-name: progress;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
