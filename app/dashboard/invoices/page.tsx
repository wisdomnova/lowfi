"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Upload, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Database, 
  Search,
  Check,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Workflow
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlanLimitAlert, PlanBadge } from "@/components/plan/PlanComponents";

interface ExtractedData {
  invoiceNumber?: string;
  amount?: number;
  date?: string;
  vendor?: string;
  status?: string;
}

interface PlanInfo {
  planName: string;
  features: any;
}

export default function InvoiceReconciliation() {
  const router = useRouter();
  const { user } = useAuth();
  const addToast = useToast((state) => state.addToast);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ExtractedData[]>([]);
  const [step, setStep] = useState<"upload" | "review" | "complete">("upload");
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [limitAlert, setLimitAlert] = useState<string | null>(null);

  useEffect(() => {
    const loadPlanInfo = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/subscriptions/current');

        if (response.ok) {
          const sub = await response.json();
          setPlanInfo({
            planName: sub.plan,
            features: {},
          });
        }
      } catch (error) {
        console.error('Error loading plan info:', error);
      }
    };

    loadPlanInfo();
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const processedResults: ExtractedData[] = [];
      if (!user?.id) throw new Error("User not authenticated");

      for (const file of files) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const base64String = Buffer.from(fileBuffer).toString("base64");
          const mimeType = file.type || "application/pdf";

          const extractionResponse = await fetch("/api/invoices/extract", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base64: base64String,
              mimeType,
            }),
          });

          if (!extractionResponse.ok) throw new Error("AI extraction failed");

          const invoiceData: ExtractedData = await extractionResponse.json();

          processedResults.push(invoiceData);

          // Save to DB via API route
          await fetch("/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              originalText: `Invoice #${invoiceData.invoiceNumber || 'unknown'}`,
              extractedData: invoiceData,
            }),
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
        }
      }

      setResults(processedResults);
      setStep("review");
    } catch (error) {
      console.error("Error processing invoices:", error);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (index: number, status: string) => {
    const result = results[index];
    setResults(results.map((r, i) => i === index ? { ...r, status } : r));
    await fetch(`/api/invoices/${result.invoiceNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-10"> 
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Invoices</h1>
            <p className="text-[#6B7280] text-lg">Upload and process invoices using AI.</p>
          </div>
          {planInfo && <PlanBadge plan={planInfo.planName} size="md" />} 
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'upload', icon: Upload, label: 'Upload' },
            { id: 'review', icon: Search, label: 'Review' },
            { id: 'complete', icon: ShieldCheck, label: 'Complete' }
          ].map((s, idx) => (
            <div key={s.id} className="flex items-center gap-4 shrink-0">
               <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all duration-500 ${
                 step === s.id 
                 ? 'bg-[#1F2937] border-[#1F2937] text-[#FAFAF8] shadow-[8px_8px_0px_0px_rgba(31,41,55,0.1)] translate-y-[-2px]' 
                 : idx < ['upload', 'review', 'complete'].indexOf(step)
                 ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                 : 'bg-[#FAFAF8] border-[#E5E7EB] text-[#9CA3AF]'
               }`}>
                  <s.icon className={`w-4 h-4 ${step === s.id ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
               </div>
               {idx < 2 && <ArrowRight className="w-4 h-4 text-[#CED4DA]" />}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8">
            {step === "upload" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-white border border-[#E5E7EB] p-16 rounded-[2.5rem] relative overflow-hidden group shadow-[4px_4px_0px_0px_#1F2937]">
                  <div className="relative z-10 text-center space-y-8">
                    <div className="w-24 h-24 bg-[#FAFAF8] border border-[#E5E7EB] rounded-3xl mx-auto flex items-center justify-center group-hover:bg-[#1F2937] group-hover:text-white transition-all duration-700">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold text-[#1F2937]">Upload Invoices</h2>
                      <p className="text-[#6B7280] text-sm max-w-sm mx-auto leading-relaxed">
                        Supporting PDF, JPEG, and PNG formats up to 10MB per file. High-quality documents work best for accurate data extraction.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto">
                      <label className="block w-full cursor-pointer group/label">
                        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                        <div className="bg-[#1F2937] text-white py-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)] hover:bg-gray-800 transition-all flex items-center justify-center gap-4 group-hover/label:translate-y-[-2px] group-hover/label:shadow-[6px_6px_0px_0px_rgba(31,41,55,0.2)] active:translate-y-0 active:shadow-none cursor-pointer">
                          <Plus className="w-4 h-4" /> Upload Files
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Database className="w-48 h-48" />
                  </div>
                </Card>

                {files.length > 0 && (
                  <Card className="bg-white border border-[#E5E7EB] rounded-[2rem] overflow-hidden p-8 animate-in fade-in duration-300 shadow-[4px_4px_0px_0px_#FAFAF8]">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F3F4F6]">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1F2937] text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                           <Workflow className="w-4 h-4" />
                        </div>
                        <h3 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em]">Processing Queue</h3>
                       </div>
                       <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">{files.length} Files</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-5 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl">
                          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] text-[#1F2937]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold text-[#1F2937] truncate">{file.name}</p>
                             <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleProcess} 
                      isLoading={uploading}
                      size="xl"
                      className="w-full"
                    >
                      Extract Invoice Data
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {step === "review" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center">
                        <Search className="w-5 h-5 text-amber-600" />
                     </div>
                     <h2 className="text-2xl font-bold text-[#1F2937]">Review Results</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAFAF8] px-5 py-3 rounded-2xl border border-[#E5E7EB]">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    <span className="text-[9px] font-black text-[#1F2937] uppercase tracking-[0.2em]">Verification Required</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {results.map((result, idx) => (
                    <Card key={idx} className="bg-white border border-[#E5E7EB] rounded-[2.5rem] overflow-hidden group shadow-[4px_4px_0px_0px_#FAFAF8] hover:shadow-[4px_4px_0px_0px_#1F2937] transition-all duration-300">
                      <div className="p-10">
                        <div className="flex items-start justify-between gap-8">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 flex-1">
                            <div>
                               <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Invoice Number</p>
                               <p className="text-sm font-bold text-[#1F2937] font-mono tracking-tighter">{result.invoiceNumber}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Amount</p>
                               <p className="text-lg font-black text-[#1F2937]">${result.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Invoice Date</p>
                               <p className="text-sm font-bold text-[#1F2937]">{result.date}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Vendor</p>
                               <p className="text-sm font-bold text-[#1F2937] truncate">{result.vendor}</p>
                            </div>
                          </div>
                        </div>

                        {result.status === "pending_review" ? (
                          <div className="flex gap-4 mt-10 pt-10 border-t border-[#F3F4F6]">
                            <Button 
                              onClick={() => updateStatus(idx, "approved")} 
                              size="lg"
                              className="flex-1 bg-white"
                              variant="secondary"
                            >
                              <Check className="w-4 h-4 text-emerald-500" /> Approve
                            </Button>
                            <Button 
                              onClick={() => updateStatus(idx, "rejected")} 
                              size="lg"
                              className="flex-1 bg-white"
                              variant="secondary"
                            >
                              <X className="w-4 h-4 text-red-500" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <div className={`mt-10 pt-10 border-t border-[#F3F4F6] flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.2em] ${result.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                {result.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                             </div>
                             Status: {result.status === 'approved' ? 'Approved' : 'Rejected'}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="pt-10 flex items-center justify-between border-t border-[#E5E7EB]">
                   <Button variant="secondary" onClick={() => { setStep("upload"); setFiles([]); setResults([]); }} className="h-16 px-10 border-[#E5E7EB] bg-white text-[#9CA3AF] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:border-[#1F2937] hover:text-[#1F2937] transition-all">Start Over</Button>
                   <Button onClick={() => setStep("complete")} className="h-16 px-12 bg-[#1F2937] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)] cursor-pointer">Complete <ArrowRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="animate-in zoom-in-95 duration-700">
                <Card className="bg-white border border-[#E5E7EB] p-24 rounded-[3.5rem] text-center space-y-10 shadow-[8px_8px_0px_0px_#FAFAF8]">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-[0_15px_40px_rgba(16,185,129,0.1)]">
                    <CheckCircle className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-[#1F2937] tracking-tight">Invoices Processed</h2>
                    <p className="text-[#6B7280] text-lg max-w-sm mx-auto leading-relaxed">
                      {results.length} invoices have been successfully extracted and saved.
                    </p>
                  </div>
                  <Button onClick={() => router.push("/dashboard")} className="h-16 px-14 bg-[#1F2937] hover:bg-gray-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)]">Return to Dashboard</Button>
                </Card>
              </div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-8">
             <Card className="p-10 bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2.5rem] space-y-8 shadow-[4px_4px_0px_0px_#1F2937]">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                      <ShieldCheck className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Status: Active</p>
                      <h4 className="text-lg font-bold text-[#1F2937] leading-tight">Invoice Processing</h4>
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-xs text-[#6B7280] leading-relaxed font-medium italic">All invoices are processed securely using AI technology. Your data is protected and never shared with third parties.</p>
                   <div className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Data Security</span>
                         <span className="text-[10px] font-black text-emerald-600">100%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                   </div>
                </div>
             </Card>

             <Card className="bg-white border border-[#E5E7EB] p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between h-[max-content] min-h-[340px] shadow-[8px_8px_0px_0px_#FAFAF8]">
                <div className="relative z-10">
                   <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#FAFAF8] rounded-full border border-[#E5E7EB] mb-8">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1F2937]\">Plan Limits</span>
                   </div>
                   <h3 className="text-3xl font-bold leading-tight text-[#1F2937]\">Increase Your Limit</h3>
                   <p className="text-[#6B7280] text-sm mt-6 leading-relaxed\">Upgrade your plan to process and store more invoices each month with priority support.</p>
                </div>
                <div className="relative z-10 pt-10">
                   <a href="/dashboard/billing" className="w-full inline-flex items-center justify-center bg-[#1F2937] hover:bg-gray-800 font-black text-[10px] uppercase tracking-[0.3em] h-16 rounded-2xl shadow-xl cursor-pointer transition-all" style={{ color: 'white' }}>
                      View Plans
                   </a>
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gray-50 rounded-full blur-3xl opacity-50" />
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
