'use client';

import { ReactNode, Component, ReactElement } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Error recovery and display system
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error detected:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        (this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] px-8">
            <div className="max-w-xl w-full bg-white border-2 border-[#E5E7EB] rounded-[3.5rem] p-16 shadow-[20px_20px_0px_0px_rgba(239,68,68,0.05)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              
              <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-red-100">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
              
              <div className="space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100 mb-2">
                   <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">Error</span>
                </div>
                <h1 className="text-4xl font-black text-[#1F2937] tracking-tighter">Something Went Wrong</h1>
                <p className="text-lg text-[#6B7280] font-medium leading-relaxed max-w-sm mx-auto">
                  An error occurred. Please try reloading the page.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="bg-[#1F2937] border border-white/10 rounded-2xl p-6 mb-12 text-left relative group">
                  <div className="absolute top-2 right-4 text-[9px] font-black text-white/20 uppercase tracking-widest">Debug Trace</div>
                  <p className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed whitespace-pre-wrap overflow-auto max-h-[200px] scrollbar-hide">
                    {this.state.error?.stack || this.state.error?.message}
                  </p>
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full h-16 bg-[#1F2937] text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.3em] hover:shadow-[0_15px_30px_-5px_rgba(31,41,55,0.3)] transition-all flex items-center justify-center gap-4 group cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                Reload Application
              </button>
              
              <p className="mt-8 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                Status: Ready
              </p>
            </div>
          </div>
        )) as ReactElement
      );
    }

    return this.props.children as ReactElement;
  }
}
