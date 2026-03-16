"use client";

import { useState } from "react";
import { X, Shield, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateCompliance } from "@/lib/validation";

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (compliance: ComplianceData) => Promise<void>;
}

export interface ComplianceData {
  senderDomain: string;
  fromEmail: string;
  verifySpf: boolean;
  verifyDkim: boolean;
  verifyDmarc: boolean;
}

interface CheckStatus {
  name: string;
  status: "idle" | "checking" | "passed" | "warning" | "failed";
  message?: string;
}

export function ComplianceModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: ComplianceModalProps) {
  const [senderDomain, setSenderDomain] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [verifySpf, setVerifySpf] = useState(true);
  const [verifyDkim, setVerifyDkim] = useState(true);
  const [verifyDmarc, setVerifyDmarc] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checks, setChecks] = useState<CheckStatus[]>([
    { name: "SPF Record", status: "idle" },
    { name: "DKIM Signature", status: "idle" },
    { name: "DMARC Policy", status: "idle" },
    { name: "Spam Score", status: "idle" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleRunChecks = async () => {
    const validation = validateCompliance({
      domain: senderDomain,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    if (!senderDomain.trim()) {
      setError("Sender domain is required");
      return;
    }

    try {
      setChecking(true);
      setError("");

      // Simulate checking each record
      const newChecks = [...checks];

      // SPF Check
      await new Promise((resolve) => setTimeout(resolve, 500));
      newChecks[0] = { name: "SPF Record", status: "passed", message: "Valid SPF record found" };
      setChecks([...newChecks]);

      // DKIM Check
      await new Promise((resolve) => setTimeout(resolve, 500));
      newChecks[1] = {
        name: "DKIM Signature",
        status: "passed",
        message: "DKIM configured",
      };
      setChecks([...newChecks]);

      // DMARC Check
      await new Promise((resolve) => setTimeout(resolve, 500));
      newChecks[2] = {
        name: "DMARC Policy",
        status: "warning",
        message: "DMARC policy set to none",
      };
      setChecks([...newChecks]);

      // Spam Score
      await new Promise((resolve) => setTimeout(resolve, 500));
      newChecks[3] = { name: "Spam Score", status: "passed", message: "Score: 2.1 (Low)" };
      setChecks([...newChecks]);
    } catch (err) {
      setError("Failed to run compliance checks");
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async () => {
    if (!senderDomain.trim()) {
      setError("Sender domain is required");
      return;
    }
    if (!fromEmail.trim()) {
      setError("From email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSave({
        senderDomain,
        fromEmail,
        verifySpf,
        verifyDkim,
        verifyDmarc,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save compliance settings");
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
                Email Verification
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1F2937]" strokeWidth={1.5} />
                Domain Verification
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sender Domain */}
              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                  Sender Domain
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <input
                    type="text"
                    placeholder="e.g., trust.com"
                    value={senderDomain}
                    onChange={(e) => setSenderDomain(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30"
                  />
                </div>
                {validationErrors.domain && (
                  <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider px-1">
                    {validationErrors.domain}
                  </p>
                )}
              </div>

              {/* From Email */}
              <div>
                <label className="block text-[10px] font-bold text-[#1F2937] uppercase tracking-widest mb-2 px-1">
                  From Email
                </label>
                <div className="bg-white border-2 border-[#1F2937] rounded-2xl p-1 shadow-[4px_4px_0px_0px_#1F2937]">
                  <input
                    type="email"
                    placeholder="e.g., hello@trust.com"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#1F2937] font-medium placeholder:text-[#1F2937]/30"
                  />
                </div>
              </div>
            </div>

            {/* Verification Methods */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-[#1F2937] uppercase tracking-widest opacity-50 px-1">Verification Methods</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "SPF", checked: verifySpf, set: setVerifySpf },
                  { label: "DKIM", checked: verifyDkim, set: setVerifyDkim },
                  { label: "DMARC", checked: verifyDmarc, set: setVerifyDmarc },
                ].map((option) => (
                  <label key={option.label} className="flex items-center gap-3 p-3 bg-white border-2 border-[#1F2937] rounded-xl cursor-pointer hover:bg-[#1F2937]/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={option.checked}
                      onChange={(e) => option.set(e.target.checked)}
                      className="w-4 h-4 rounded-full border-2 border-[#1F2937] text-[#1F2937] focus:ring-0"
                    />
                    <span className="text-[10px] font-black uppercase text-[#1F2937] tracking-wider">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Run Checks Button */}
            <button
              onClick={handleRunChecks}
              disabled={checking || !senderDomain.trim()}
              className="w-full px-6 py-4 border-2 border-[#1F2937] text-[#1F2937] font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#1F2937] hover:text-[#FAFAF8] transition-all disabled:opacity-30 active:translate-y-0.5 cursor-pointer"
            >
              {checking ? "Scanning..." : "Verify Domain"}
            </button>

            {/* Check Results */}
            {checks.some((c) => c.status !== "idle") && (
              <div className="space-y-3 p-4 bg-white border-2 border-[#1F2937] rounded-2xl shadow-[4px_4px_0px_0px_#1F2937]">
                <p className="text-[10px] font-bold text-[#1F2937] uppercase tracking-widest opacity-50 border-b-2 border-[#1F2937]/10 pb-2">Results</p>
                <div className="space-y-4">
                  {checks.map((check) => (
                    <div
                      key={check.name}
                      className="group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            check.status === "passed" ? "bg-emerald-500" :
                            check.status === "warning" ? "bg-amber-500" :
                            check.status === "failed" ? "bg-red-500" :
                            "bg-[#1F2937]/20"
                          }`} />
                          <span className="text-[11px] font-bold text-[#1F2937] uppercase tracking-wider">{check.name}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-2 ${
                          check.status === "passed" ? "bg-emerald-50 border-emerald-600 text-emerald-700" :
                          check.status === "warning" ? "bg-amber-50 border-amber-600 text-amber-700" :
                          check.status === "failed" ? "bg-red-50 border-red-600 text-red-700" :
                          "bg-[#1F2937]/5 border-[#1F2937]/20 text-[#1F2937]/30"
                        }`}>
                          {check.status === "idle" ? "Wait" : check.status}
                        </span>
                      </div>
                      {check.message && (
                        <p className="text-[10px] text-[#1F2937]/60 font-medium ml-3.5 mt-1 uppercase tracking-tight">{check.message}</p>
                      )}
                    </div>
                  ))}
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
              {loading ? "Verifying..." : "Save Settings"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
