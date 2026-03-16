"use client";

import { useState } from "react";
import { X, Zap, Check, Building, Cloud, Hash, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { validateIntegration } from "@/lib/validation";

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSave: (integration: IntegrationData) => Promise<void>;
}

export interface IntegrationData {
  provider: string;
  apiKey: string;
  syncEnabled: boolean;
  syncFrequency?: "hourly" | "daily" | "weekly";
}

const PROVIDERS = [
  { value: "hubspot", label: "HubSpot", Icon: Building },
  { value: "salesforce", label: "Salesforce", Icon: Cloud },
  { value: "slack", label: "Slack", Icon: Hash },
  { value: "zapier", label: "Zapier", Icon: Zap },
];

export function IntegrationModal({
  isOpen,
  onClose,
  campaignId,
  onSave,
}: IntegrationModalProps) {
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState<"hourly" | "daily" | "weekly">(
    "daily"
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setError("API key is required to test");
      return;
    }

    try {
      setTesting(true);
      setError("");
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTestResult("success");
    } catch (err) {
      setTestResult("error");
      setError("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const validation = validateIntegration({
      provider,
      apiKey,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    if (!provider) {
      setError("Please select a provider");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSave({
        provider,
        apiKey,
        syncEnabled,
        syncFrequency: syncEnabled ? syncFrequency : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save integration");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-[#1F2937]/20">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start border-b border-[#1F2937]/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#1F2937]/30" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1F2937]/40">Integrations</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Third-Party Integration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[#FAFAF8] rounded-full transition-colors text-[#1F2937]/40 hover:text-[#1F2937] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto space-y-8">
          {/* Provider Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Provider</label>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={`p-5 rounded-2xl border transition-all text-center group cursor-pointer ${
                    provider === p.value
                      ? "bg-[#1F2937] text-white border-[#1F2937] shadow-lg shadow-[#1F2937]/10"
                      : "bg-[#FAFAF8] border-transparent text-[#1F2937]/50 hover:border-[#1F2937]/10"
                  }`}
                >
                  <p.Icon className={`w-6 h-6 mx-auto mb-2 transition-colors ${provider === p.value ? "text-white" : "text-[#1F2937]/20 group-hover:text-[#1F2937]/40"}`} />
                  <p className="text-[11px] font-bold uppercase tracking-widest">{p.label}</p>
                </button>
              ))}
            </div>
            {validationErrors.provider && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">{validationErrors.provider}</p>}
          </div>

          {provider && (
            <>
              {/* API Key Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Access Token / API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="Enter authentication key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full h-12 px-5 pr-14 bg-[#FAFAF8] border rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none transition-all ${
                      validationErrors.apiKey ? "border-red-500/50" : "border-[#1F2937]/5 focus:ring-1 focus:ring-[#1F2937]/20"
                    }`}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-[#1F2937]/30 hover:text-[#1F2937] transition-colors cursor-pointer"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                {validationErrors.apiKey && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">{validationErrors.apiKey}</p>}
              </div>

              {/* Test Connection */}
              <button
                onClick={handleTestConnection}
                disabled={testing || !apiKey}
                className={`w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:cursor-not-allowed ${
                  testResult === "success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : testResult === "error"
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-[#FAFAF8] text-[#1F2937]/60 hover:bg-[#1F2937]/5 disabled:opacity-50"
                }`}
              >
                {testing ? "Testing..." : testResult === "success" ? "Connected" : "Test Connection"}
              </button>

              {/* Sync Settings */}
              <div className="pt-4 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={syncEnabled}
                      onChange={(e) => setSyncEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${syncEnabled ? 'bg-emerald-500' : 'bg-[#1F2937]/10'}`} />
                    <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${syncEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F2937]">Auto Sync Enabled</span>
                </label>

                {syncEnabled && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 block px-1">Sync Frequency</label>
                    <div className="relative">
                      <select
                        value={syncFrequency}
                        onChange={(e) => setSyncFrequency(e.target.value as "hourly" | "daily" | "weekly")}
                        className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#1F2937]/20">
                         <Hash className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
            disabled={loading || !provider}
            className="flex-[2] h-14 bg-[#1F2937] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#1F2937]/10 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Saving..." : "Save Integration"}
          </button>
        </div>
      </div>
    </div>
  );
}
