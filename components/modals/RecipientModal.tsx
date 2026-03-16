"use client";

import { useState } from "react";
import { X, Users, Upload, BarChart2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateRecipients } from "@/lib/validation";

interface RecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (recipients: RecipientData) => Promise<void>;
}

export interface RecipientData {
  method: "csv" | "manual" | "segment";
  recipientCount: number;
  segmentId?: string;
  csvData?: string;
  duplicateHandling: "skip" | "replace" | "allow";
}

export function RecipientModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: RecipientModalProps) {
  const [method, setMethod] = useState<"csv" | "manual" | "segment">("csv");
  const [csvText, setCsvText] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [duplicateHandling, setDuplicateHandling] = useState<"skip" | "replace" | "allow">(
    "skip"
  );
  const [recipientCount, setRecipientCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const lines = content
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));
      setRecipientCount(lines.length - 1); // Subtract header row
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    const validation = validateRecipients({
      recipientSource: method,
      csvData: method === "csv" ? csvText : undefined,
      segmentId: method === "segment" ? segmentId : undefined,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    if (method === "csv" && !csvText.trim()) {
      setError("Please upload or paste CSV data");
      return;
    }
    if (method === "segment" && !segmentId.trim()) {
      setError("Please select a segment");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSave({
        method,
        recipientCount: method === "csv" ? recipientCount : 0,
        segmentId: method === "segment" ? segmentId : undefined,
        csvData: method === "csv" ? csvText : undefined,
        duplicateHandling,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import recipients");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-[#1F2937]/20">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start border-b border-[#1F2937]/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#1F2937]/30" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1F2937]/40">Recipients</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Add Recipients</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[#FAFAF8] rounded-full transition-colors text-[#1F2937]/40 hover:text-[#1F2937]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto space-y-8">
          {/* Method Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block mb-4 px-1">How to Add</label>
            <div className="flex gap-2">
              {[
                { value: "csv", label: "Upload CSV" },
                { value: "segment", label: "Use Segment" },
                { value: "manual", label: "Manual Entry" },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value as "csv" | "manual" | "segment")}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold transition-all border ${
                    method === m.value
                      ? "bg-[#1F2937] text-white border-[#1F2937] shadow-lg shadow-[#1F2937]/10"
                      : "bg-[#FAFAF8] text-[#1F2937]/50 border-transparent hover:border-[#1F2937]/10"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSV Upload */}
          {method === "csv" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">CSV File</label>
                <label className="flex flex-col items-center justify-center w-full px-4 py-10 border-2 border-dashed border-[#1F2937]/10 rounded-2xl cursor-pointer hover:bg-[#FAFAF8] hover:border-[#1F2937]/20 transition-all group">
                  <Upload className="w-6 h-6 mb-3 text-[#1F2937]/20 group-hover:text-[#1F2937]/40 transition-colors" />
                  <span className="text-xs font-bold text-[#1F2937]/40 uppercase tracking-widest">Drop CSV Directive</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {csvText && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40">Data Preview</label>
                    <span className="text-[10px] font-bold text-emerald-500 tabular-nums">{recipientCount} DETECTED</span>
                  </div>
                  <textarea
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      const lines = e.target.value.split("\n").filter((line) => line.trim());
                      setRecipientCount(Math.max(0, lines.length - 1));
                    }}
                    rows={4}
                    className={`w-full p-5 bg-[#FAFAF8] border rounded-xl text-xs font-mono text-[#1F2937] focus:outline-none transition-all resize-none ${
                      validationErrors.csvData ? "border-red-500/50" : "border-[#1F2937]/5 focus:ring-1 focus:ring-[#1F2937]/20"
                    }`}
                  />
                  {validationErrors.csvData && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">{validationErrors.csvData}</p>}
                </div>
              )}
            </div>
          )}

          {/* Segment Selection */}
          {method === "segment" && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Target Segment</label>
              <div className="relative">
                <select
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className={`w-full h-12 px-5 bg-[#FAFAF8] border rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none transition-all appearance-none cursor-pointer ${
                    validationErrors.segmentId ? "border-red-500/50" : "border-[#1F2937]/5 focus:ring-1 focus:ring-[#1F2937]/20"
                  }`}
                >
                  <option value="">SELECT SEGMENT...</option>
                  <option value="active">ACTIVE NODES</option>
                  <option value="inactive">DORMANT NODES</option>
                  <option value="high-value">VALUED ENTITIES</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#1F2937]/20">
                   <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              {validationErrors.segmentId && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">{validationErrors.segmentId}</p>}
            </div>
          )}

          {/* Manual Entry */}
          {method === "manual" && (
            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40">Manual Vector Entry</label>
                <span className="text-[10px] font-bold text-[#1F2937]/30 tabular-nums">{recipientCount} ENTRIES</span>
              </div>
              <textarea
                placeholder="email@node.com&#10;target@entity.org"
                onChange={(e) => {
                  const lines = e.target.value.split("\n").filter((line) => line.trim());
                  setRecipientCount(lines.length);
                  setCsvText(lines.join("\n"));
                }}
                rows={6}
                className="w-full p-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#1F2937]/20 transition-all resize-none"
              />
            </div>
          )}

          {/* Duplicate Handling */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Duplicate Handling</label>
            <div className="relative">
              <select
                value={duplicateHandling}
                onChange={(e) => setDuplicateHandling(e.target.value as "skip" | "replace" | "allow")}
                className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="skip">FILTER REDUNDANCY</option>
                <option value="replace">REWRITE EXISTING</option>
                <option value="allow">PERMIT OVERLAP</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#1F2937]/20">
                 <X className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-[#FAFAF8] border-t border-[#1F2937]/5 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-14 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#1F2937]/40 hover:text-[#1F2937] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] h-14 bg-[#1F2937] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#1F2937]/10 hover:bg-black transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Uploading..." : "Add Recipients"}
          </button>
        </div>
      </div>
    </div>
  );
}
