"use client";

import { useState } from "react";
import { X, Workflow, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateAutomation } from "@/lib/validation";

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (automation: AutomationData) => Promise<void>;
}

export interface AutomationData {
  name: string;
  description?: string;
  trigger: string;
  action: string;
  triggerData?: Record<string, any>;
  actionData?: Record<string, any>;
}

const TRIGGER_TYPES = [
  { label: "Email Opened", value: "email_open" },
  { label: "Email Link Clicked", value: "email_click" },
  { label: "Form Submitted", value: "form_submit" },
  { label: "Specific Date", value: "date" },
  { label: "Webhook Event", value: "webhook" },
];

const ACTION_TYPES = [
  { label: "Send Email", value: "send_email" },
  { label: "Send Campaign", value: "send_campaign" },
  { label: "Add Tag", value: "add_tag" },
  { label: "Update Field", value: "update_field" },
];

export function AutomationModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: AutomationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("email_open");
  const [action, setAction] = useState("send_email");
  const [waitTime, setWaitTime] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const validation = validateAutomation({
      workflowName: name,
      triggerType: trigger,
      actionType: action,
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
        name,
        description: description || undefined,
        trigger,
        action,
        triggerData: { waitMinutes: waitTime },
        actionData: {},
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create automation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-[#FAFAF8] border-2 border-[#1F2937] shadow-2xl shadow-[#1F2937]/20 rounded-[2.5rem] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-[10px] font-bold text-[#1F2937] uppercase tracking-[0.2em] mb-1 opacity-50">
                Workflows
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
                Automation
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
            {/* Automation Name */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Workflow Name
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <input
                  type="text"
                  placeholder="e.g., Send follow-up email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30"
                />
              </div>
              {validationErrors.workflowName && (
                <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider px-1">
                  {validationErrors.workflowName}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                Description
              </label>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <textarea
                  placeholder="What this automation does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trigger */}
              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1 text-blue-600">
                  When
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.triggerType && (
                  <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider px-1">
                    {validationErrors.triggerType}
                  </p>
                )}
              </div>

              {/* Action */}
              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1 text-emerald-600">
                  Then
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                  >
                    {ACTION_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>{a.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.actionType && (
                  <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider px-1">
                    {validationErrors.actionType}
                  </p>
                )}
              </div>
            </div>

            {/* Delay/Wait Time */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] font-bold text-[#1F2937] uppercase tracking-widest">
                  Wait Time
                </label>
                <span className="text-[10px] font-bold text-[#1F2937] tabular-nums">
                  {Math.floor(waitTime / 60)}h {waitTime % 60}m
                </span>
              </div>
              <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                <input
                  type="range"
                  min="0"
                  max="1440"
                  step="15"
                  value={waitTime}
                  onChange={(e) => setWaitTime(parseInt(e.target.value))}
                  className="w-full h-8 accent-[#1F2937] cursor-pointer px-2"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
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
              {loading ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
