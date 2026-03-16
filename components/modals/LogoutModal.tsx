"use client";

import { LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <LogOut className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign Out?</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              You are about to sign out of <span className="text-slate-900 font-bold">LowFi</span>. 
              Your data will be saved and available when you sign back in.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onConfirm}
              variant="danger"
              size="lg"
              className="w-full h-12"
            >
              Sign Out
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              size="lg"
              className="w-full h-12"
            >
              Stay Logged In
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: Signing Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
