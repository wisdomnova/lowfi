'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Ticket, Shield, Terminal, Plus } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { emailFrom: string; subject: string; body: string; category: string }) => void;
  isLoading?: boolean;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateTicketModalProps) {
  const [emailFrom, setEmailFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailFrom.trim() && subject.trim() && body.trim()) {
      onCreate({ emailFrom, subject, body, category });
      setEmailFrom('');
      setSubject('');
      setBody('');
      setCategory('other');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAFAF8] rounded-[2.5rem] border-4 border-[#1F2937] p-10 w-full max-w-lg shadow-[12px_12px_0px_0px_#1F2937] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F2937] flex items-center justify-center text-white">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-0.5">Support</p>
              <h2 className="text-2xl font-black text-[#1F2937] tracking-tight">
                Create Ticket
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[#1F2937]/5 flex items-center justify-center transition-colors group"
          >
            <X className="w-5 h-5 text-[#1F2937]/40 group-hover:text-[#1F2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Customer Email"
              type="email"
              placeholder="customer@example.com"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              required
            />

            <Input
              label="Subject"
              type="text"
              placeholder="Support request regarding..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
                Category
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-[#1F2937] rounded-2xl opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none" />
                <div className="relative border-2 border-[#1F2937] rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1F2937]">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-6 py-4 bg-transparent text-[#1F2937] font-bold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="other">General Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="feature">Feature Request</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#1F2937]/40">
                    <Terminal className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-[#1F2937]/5 border border-[#1F2937]/10 rounded-2xl flex gap-3">
                <Shield className="w-4 h-4 text-[#1F2937]/40 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-[#1F2937]/60 leading-relaxed italic">
                  {category === 'other' && 'Standard support inquiries and non-technical questions.'}
                  {category === 'technical' && 'Issues related to platform functionality or software bugs.'}
                  {category === 'billing' && 'Questions about subscriptions, invoices, or payments.'}
                  {category === 'feature' && 'Suggestions and requests for new platform capabilities.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 px-1">Description</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-[#1F2937] rounded-[2rem] opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none" />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="relative w-full h-32 px-6 py-5 bg-white border-2 border-[#1F2937] rounded-[2rem] text-[#1F2937] font-bold placeholder:text-[#1F2937]/20 focus:outline-none transition-all shadow-[4px_4px_0px_0px_#1F2937] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !emailFrom.trim() || !subject.trim() || !body.trim()}
              className="flex-1 h-14 text-base font-black uppercase tracking-widest gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Ticket
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-14 text-base font-black uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
