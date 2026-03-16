'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader, Eye, Save, X, Hash, Layout, Type, Terminal, Activity } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function CreateTemplatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    variables: [] as string[],
  });

  const [variableInput, setVariableInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const addVariable = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && variableInput.trim()) {
      e.preventDefault();
      if (!formData.variables.includes(variableInput.trim())) {
        setFormData({
          ...formData,
          variables: [...formData.variables, variableInput.trim()],
        });
      }
      setVariableInput('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setError('Please fill in all required fields: name, subject line, and email body');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }

      router.push('/dashboard/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-2 text-[#1F2937]/40 hover:text-[#1F2937] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Templates</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Email Templates</p>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Create New Template</h1>
            <p className="text-[#1F2937]/60 mt-2 font-medium">Build a reusable email template with dynamic variables</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/templates" className="cursor-pointer">
              <Button size="lg" variant="secondary" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              isLoading={loading}
              size="lg"
              className="gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-2xl text-red-600 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">!</div>
            <p className="font-bold text-sm tracking-tight">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Template Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                  />

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
                      Classification
                    </label>
                    <div className="relative border-2 border-[#1F2937] rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1F2937]">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 bg-transparent text-[#1F2937] font-bold focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="general">General</option>
                        <option value="campaign">Campaign</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="transactional">Transactional</option>
                        <option value="promotional">Promotional</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Input
                  label="Subject Line"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Welcome to our service"
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
                    Email Body
                  </label>
                  <div className="relative border-2 border-[#1F2937] rounded-[2rem] bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1F2937]">
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Write your email content here..."
                      rows={12}
                      className="w-full px-6 py-4 bg-transparent text-[#1F2937] placeholder-[#1F2937]/30 focus:outline-none font-medium leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* Variables */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40">
                    Variables
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        value={variableInput}
                        onChange={(e) => setVariableInput(e.target.value)}
                        onKeyDown={addVariable}
                        placeholder="Add variable (Press Enter)"
                        className="shadow-none"
                        hideLabel
                      />
                    </div>
                  </div>
                  {formData.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.variables.map((variable) => (
                        <div
                          key={variable}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-full border-2 border-[#1F2937] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
                        >
                          <span className="text-[10px] font-black font-mono">{"{{"} {variable} {"}}"}</span>
                          <button
                            type="button"
                            onClick={() => removeVariable(variable)}
                            className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-[#1F2937] transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Visualizer */}
            <Card className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1F2937] flex items-center justify-center text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-[#1F2937]">Template Preview</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-[#1F2937] transition-colors cursor-pointer ${
                    showPreview ? 'bg-[#1F2937] text-white' : 'bg-[#FAFAF8] text-[#1F2937]/40 hover:text-[#1F2937]'
                  }`}
                >
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPreview ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Subject Line</p>
                    <p className="text-sm font-black text-[#1F2937] break-words">
                      {formData.subject || 'No subject line'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]/40 mb-2">Email Content</p>
                    <div className="p-6 bg-[#FAFAF8] border-2 border-[#1F2937] rounded-[2rem] text-xs font-medium text-[#1F2937] whitespace-pre-wrap leading-relaxed shadow-[4px_4px_0px_0px_#1F2937]">
                      {formData.body || 'No content defined.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-[#1F2937]/20 rounded-[2.5rem]">
                  <Activity className="w-10 h-10 text-[#1F2937]/10 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1F2937]/30 px-4">
                    Preview inactive. Click Show to visualize your template.
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-8 bg-[#1F2937] text-white">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Terminal className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Template Tips</p>
              <ul className="space-y-4">
                {[
                  { icon: Type, text: 'Templates are reusable email patterns for all your campaigns.' },
                  { icon: Hash, text: 'Use variables like {name}, {email} and they will be replaced automatically.' },
                  { icon: Layout, text: 'Keep emails clear and concise for better engagement.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs font-bold leading-relaxed text-white/80">
                    <item.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/40" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
