'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Users, Shield, Terminal } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
  isLoading?: boolean;
}

export default function InviteModal({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email, role);
      setEmail('');
      setRole('member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAFAF8] rounded-[2.5rem] border-4 border-[#1F2937] p-10 w-full max-w-lg shadow-[12px_12px_0px_0px_#1F2937] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F2937] flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-0.5">Team</p>
              <h2 className="text-2xl font-black text-[#1F2937] tracking-tight">
                Invite Team Member
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
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
              Role
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-[#1F2937] rounded-2xl opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none" />
              <div className="relative border-2 border-[#1F2937] rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1F2937]">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-6 py-4 bg-transparent text-[#1F2937] font-bold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="member">Team Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#1F2937]/40">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-[#1F2937]/5 border border-[#1F2937]/10 rounded-2xl flex gap-3">
              <Shield className="w-4 h-4 text-[#1F2937]/40 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-[#1F2937]/60 leading-relaxed italic">
                {role === 'member' && 'This member can view and manage their assigned projects and tasks.'}
                {role === 'manager' && 'This member can manage team data, invite members, and view reports.'}
                {role === 'admin' && 'This member has full access to all settings and team management.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 h-14 text-base font-black uppercase tracking-widest gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Invite'
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
