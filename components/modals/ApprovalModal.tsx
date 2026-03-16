"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateApproval } from "@/lib/validation";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (approval: ApprovalData) => Promise<void>;
}

export interface ApprovalData {
  approverId: string;
  approverEmail: string;
  notes: string;
  requireApproval: boolean;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
}

export function ApprovalModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: ApprovalModalProps) {
  const [requireApproval, setRequireApproval] = useState(true);
  const [approverEmail, setApproverEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const response = await fetch("/api/team/members", {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error("Failed to fetch team members");
      
      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Could not load team members");
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleSave = async () => {
    if (requireApproval) {
      const validation = validateApproval({
        approverEmail,
      });

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }
    }

    setValidationErrors({});

    if (requireApproval && !approverEmail.trim()) {
      setError("Please select an approver");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const approverId =
        teamMembers.find((m) => m.email === approverEmail)?.id || "";

      await onSave({
        approverId,
        approverEmail,
        notes,
        requireApproval,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save approval settings");
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
                Approvals
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
                Approval Settings
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
            {/* Approval Requirement */}
            <div 
              onClick={() => setRequireApproval(!requireApproval)}
              className={`p-1 rounded-2xl border-2 transition-all cursor-pointer ${
                requireApproval 
                  ? "bg-[#1F2937] border-[#1F2937]" 
                  : "bg-white border-[#1F2937]/10"
              }`}
            >
              <div className={`p-4 rounded-xl flex items-center gap-4 ${
                requireApproval ? "bg-[#1F2937] text-[#FAFAF8]" : "bg-white text-[#1F2937]"
              }`}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  requireApproval ? "border-[#FAFAF8] bg-[#FAFAF8]/10" : "border-[#1F2937]"
                }`}>
                  {requireApproval && <CheckCircle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs">
                    Require Approval
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-60 font-medium">
                    Campaign must be reviewed before sending
                  </p>
                </div>
              </div>
            </div>

            {requireApproval ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Approver Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                    Approver
                  </label>
                  <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                    <select
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium appearance-none"
                      disabled={loadingTeam}
                    >
                      <option value="">Select an Authority...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.email}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.approverEmail && (
                    <p className="mt-2 text-[10px] font-bold text-red-600 uppercase tracking-wider px-1">
                      {validationErrors.approverEmail}
                    </p>
                  )}
                </div>

                {/* Review Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                    Review Notes
                  </label>
                  <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                    <textarea
                      rows={3}
                      placeholder="Specify review criteria or context..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30 resize-none"
                    />
                  </div>
                </div>

                {/* Status List */}
                <div className="p-4 bg-[#1F2937]/5 rounded-2xl border-2 border-[#1F2937]/10">
                  <p className="text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-3 opacity-50">
                    What happens:
                  </p>
                  <div className="space-y-2">
                    {[
                      "Campaign locked while awaiting approval",
                      "Approval notification sent",
                      "Campaign paused until approved",
                      "Activity logged"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-[#1F2937]">
                        <div className="w-1 h-1 rounded-full bg-[#1F2937]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-white border-2 border-[#1F2937] rounded-2xl shadow-[4px_4px_0px_0px_rgba(31,41,55,0.1)]">
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Immediate Execution Warning: No validation gates active.
                  </p>
                </div>
              </div>
            )}

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
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
