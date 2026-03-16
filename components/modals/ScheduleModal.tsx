"use client";

import { useState } from "react";
import { X, Calendar, Clock, Repeat2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (schedule: ScheduleData) => Promise<void>;
}

export interface ScheduleData {
  sendTime: string;
  timezone: string;
  recurring?: string;
  recurringEnd?: string;
  optimizeSendTime?: boolean;
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
];

const RECURRENCE_OPTIONS = [
  { label: "One-time", value: "" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export function ScheduleModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: ScheduleModalProps) {
  const [sendTime, setSendTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [timezone, setTimezone] = useState("UTC");
  const [recurring, setRecurring] = useState("");
  const [recurringEnd, setRecurringEnd] = useState("");
  const [optimizeSendTime, setOptimizeSendTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      await onSave({
        sendTime,
        timezone,
        recurring: recurring || undefined,
        recurringEnd: recurringEnd || undefined,
        optimizeSendTime,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[#FAFAF8] border-2 border-[#1F2937] shadow-2xl shadow-[#1F2937]/20 rounded-[2.5rem] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-[10px] font-bold text-[#1F2937] uppercase tracking-[0.2em] mb-1 opacity-50">
                Schedule
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
                Send Schedule
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1F2937]/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Send Time */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Send Date & Time
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <input
                  type="datetime-local"
                  value={sendTime}
                  onChange={(e) => setSendTime(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Timezone
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Repeat
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Optimization Toggle */}
            <div 
              onClick={() => setOptimizeSendTime(!optimizeSendTime)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                optimizeSendTime 
                  ? "bg-[#1F2937] border-[#1F2937] text-[#FAFAF8]" 
                  : "bg-white border-[#1F2937]/10 text-[#1F2937]"
              }`}
            >
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px]">
                  Optimize Send Time
                </p>
                <p className="text-[9px] mt-0.5 opacity-60 font-medium uppercase">
                  Send at the best time for each recipient
                </p>
              </div>
              <div className={`w-10 h-5 rounded-full border-2 transition-colors relative ${
                optimizeSendTime ? "bg-[#FAFAF8] border-[#FAFAF8]" : "bg-[#1F2937]/10 border-[#1F2937]/20"
              }`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all ${
                  optimizeSendTime ? "right-1 bg-[#1F2937]" : "left-1 bg-[#1F2937]/40"
                }`} />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <button
              onClick={onClose}
              className="px-6 py-4 border-2 border-[#1F2937] text-[#1F2937] font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#1F2937]/5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-4 bg-[#1F2937] text-[#FAFAF8] font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#1F2937]/90 transition-all active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(31,41,55,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
