"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (test: ABTestData) => Promise<void>;
}

export interface ABTestData {
  name: string;
  testType: "subject" | "content" | "sendtime";
  variantA: Record<string, any>;
  variantB: Record<string, any>;
  splitPercent: number;
}

export function ABTestModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: ABTestModalProps) {
  const [name, setName] = useState("");
  const [testType, setTestType] = useState<"subject" | "content" | "sendtime">(
    "subject"
  );
  const [variantASubject, setVariantASubject] = useState("");
  const [variantBSubject, setVariantBSubject] = useState("");
  const [splitPercent, setSplitPercent] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Test name is required");
      return;
    }

    if (!variantASubject.trim() || !variantBSubject.trim()) {
      setError("Both variants are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSave({
        name,
        testType,
        variantA: { subject: variantASubject },
        variantB: { subject: variantBSubject },
        splitPercent,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create test");
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
                Testing
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
                A/B Test
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
            {/* Test Name */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Test Name
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <input
                  type="text"
                  placeholder="e.g., Subject Line Alpha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30"
                />
              </div>
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                What to Test
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <select
                  value={testType}
                  onChange={(e) =>
                    setTestType(e.target.value as "subject" | "content" | "sendtime")
                  }
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                >
                  <option value="subject">Subject Line</option>
                  <option value="content">Email Content</option>
                  <option value="sendtime">Send Time</option>
                </select>
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                  Variant A
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <input
                    type="text"
                    placeholder="Subject line variant A"
                    value={variantASubject}
                    onChange={(e) => setVariantASubject(e.target.value)}
                    className="w-full px-4 py-2 bg-transparent focus:outline-none text-[#1F2937] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                  Variant B
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <input
                    type="text"
                    placeholder="Subject line variant B"
                    value={variantBSubject}
                    onChange={(e) => setVariantBSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-transparent focus:outline-none text-[#1F2937] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Split Percentage */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] font-bold text-[#1F2937] uppercase tracking-widest">
                  Traffic Split
                </label>
                <span className="text-[10px] font-bold text-[#1F2937] tabular-nums">
                  {splitPercent}% A / {100 - splitPercent}% B
                </span>
              </div>
              <div className="h-2 bg-[#1F2937]/10 rounded-full overflow-hidden border border-[#1F2937]/20 relative">
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-[#1F2937] transition-all duration-300"
                  style={{ width: `${splitPercent}%` }}
                />
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
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
