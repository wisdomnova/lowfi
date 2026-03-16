"use client";

import { Shield, X, Lock, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaymentSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentSecurityModal({ isOpen, onClose }: PaymentSecurityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1F2937]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1F2937]/5">
        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-[2rem] flex items-center justify-center text-[#1F2937] ring-8 ring-[#F3F4F6]/50">
              <Shield className="w-8 h-8" />
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-[#F3F4F6] rounded-2xl transition-colors text-[#9CA3AF] hover:text-[#1F2937]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 mb-10">
            <h3 className="text-3xl font-bold text-[#1F2937] tracking-tight">Payment Security</h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              We take your security seriously. All transactions on <span className="text-[#1F2937] font-bold">LowFi</span> are encrypted and handled by industry leaders.
            </p>

            <div className="grid gap-4 mt-8">
              <div className="flex items-start gap-5 p-6 bg-[#FAFAF8] rounded-[2rem] border border-[#1F2937]/5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Lock className="w-5 h-5 text-[#1F2937]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">Stripe Protection</h4>
                  <p className="text-xs text-[#6B7280]">We use Stripe for payment processing. We never store your card details on our servers.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-[#FAFAF8] rounded-[2rem] border border-[#1F2937]/5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#1F2937]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">PCI Compliance</h4>
                  <p className="text-xs text-[#6B7280]">Stripe has been audited by a PCI-certified auditor and is certified to PCI Service Provider Level 1.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-[#FAFAF8] rounded-[2rem] border border-[#1F2937]/5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[#1F2937]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">RSA Encryption</h4>
                  <p className="text-xs text-[#6B7280]">All payment data is encrypted with 256-bit AES encryption to ensure your data stays safe.</p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose}
            size="lg"
            className="w-full h-14 rounded-2xl"
          >
            Got it, thanks!
          </Button>
        </div>

        {/* Footer info */}
        <div className="bg-[#FAFAF8] px-10 py-5 flex items-center justify-between border-t border-[#1F2937]/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-[#1F2937]/40 uppercase tracking-widest">Status: Secure Terminal</span>
          </div>
          <a href="https://stripe.com/docs/security/stripe" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#1F2937]/60 uppercase tracking-widest flex items-center gap-1 hover:text-[#1F2937] transition-colors">
            Stripe Security <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
