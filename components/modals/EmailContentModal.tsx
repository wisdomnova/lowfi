"use client";

import { useState } from "react";
import { X, Mail, Type, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateEmailContent } from "@/lib/validation";

interface EmailContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (content: EmailContentData) => Promise<void>;
}

export interface EmailContentData {
  contentType: "plaintext" | "html" | "rich_text";
  subject: string;
  preheader?: string;
  content: string;
}

export function EmailContentModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: EmailContentModalProps) {
  const [contentType, setContentType] = useState<"plaintext" | "html" | "rich_text">(
    "plaintext"
  );
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const validation = validateEmailContent({
      subject,
      content,
      fromName: "LowFi",
      fromEmail: "hello@lowfi.com",
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    try {
      setLoading(true);
      setError("");

      await onSave({
        contentType,
        subject,
        preheader: preheader || undefined,
        content,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save email content");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-[#1F2937]/20">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start border-b border-[#1F2937]/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-[#1F2937]/30" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1F2937]/40">Email Content</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Email Content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[#FAFAF8] rounded-full transition-colors text-[#1F2937]/40 hover:text-[#1F2937]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto space-y-8">
          {/* Content Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block mb-4 ml-1">Format</label>
            <div className="flex gap-2">
              {[
                { value: "plaintext", label: "Plain Text" },
                { value: "html", label: "HTML" },
                { value: "rich_text", label: "Rich Text" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as "plaintext" | "html" | "rich_text")}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold transition-all border ${
                    contentType === type.value
                      ? "bg-[#1F2937] text-white border-[#1F2937] shadow-lg shadow-[#1F2937]/10"
                      : "bg-[#FAFAF8] text-[#1F2937]/50 border-transparent hover:border-[#1F2937]/10"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40">Subject Line</label>
              <span className="text-[9px] font-bold text-[#1F2937]/20 tabular-nums">{subject.length}/100</span>
            </div>
            <input
              type="text"
              placeholder="e.g., Get started now..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full h-12 px-5 bg-[#FAFAF8] border rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none transition-all ${
                validationErrors.subject ? "border-red-500/50" : "border-[#1F2937]/5 focus:ring-1 focus:ring-[#1F2937]/20"
              }`}
            />
            {validationErrors.subject && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">{validationErrors.subject}</p>}
          </div>

          {/* Preheader */}
          <div className="space-y-3">
             <div className="flex justify-between items-end px-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40">Preview Text (Optional)</label>
               <span className="text-[9px] font-bold text-[#1F2937]/20 tabular-nums">{preheader.length}/150</span>
             </div>
            <input
              type="text"
              placeholder="What appears in inboxes..."
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#1F2937]/20 transition-all"
            />
          </div>

          {/* Email Content */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Email Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className={`w-full p-6 bg-[#FAFAF8] border rounded-[1.5rem] text-sm font-medium text-[#1F2937] focus:outline-none transition-all resize-none ${
                validationErrors.content ? "border-red-500/50" : "border-[#1F2937]/5 focus:ring-1 focus:ring-[#1F2937]/20"
              }`}
            />
            <div className="flex justify-between items-center px-1">
               <span className="text-[9px] font-bold text-[#1F2937]/30 italic opacity-60">Use &#123;first_name&#125; for variable injection</span>
               {validationErrors.content && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{validationErrors.content}</p>}
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
            {loading ? "Saving..." : "Save Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
