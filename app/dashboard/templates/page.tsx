'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import { CardSkeleton } from '@/components/Skeleton';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete template');
    }
  }

  const filteredTemplates =
    categoryFilter === 'all'
      ? templates
      : templates.filter((t) => t.category === categoryFilter);

  const categories = ['all', ...new Set(templates.map((t) => t.category))];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-10 space-y-12 pb-20">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#1F2937]/20" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/40">Assets</span>
            </div>
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">
              Email Templates
            </h1>
            <p className="text-[#1F2937]/50 font-medium mt-1">
              Manage reusable email templates with variables for your campaigns.
            </p>
          </div>
          <Link
            href="/dashboard/templates/create"
            className="h-12 px-8 bg-[#1F2937] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_#1F2937] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30 mr-2">Filter by Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    categoryFilter === category
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-[#1F2937]/5 text-[#1F2937]/60 hover:bg-[#1F2937]/10'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>

            {/* Templates List */}
            {filteredTemplates.length === 0 ? (
              <EmptyState 
                title="No Templates Yet"
                description="Create your first email template to get started with your campaigns."
                icon={FileText}
                action={{
                  label: "Create Template",
                  onClick: () => router.push('/dashboard/templates/create')
                }}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-[2rem] border border-[#1F2937]/5 p-8 hover:border-[#1F2937]/20 transition-all group overflow-hidden relative"
                  >
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <span className="px-2 py-0.5 rounded bg-[#1F2937]/5 text-[#1F2937]/40 text-[9px] font-bold uppercase tracking-widest mb-2 inline-block">
                            {template.category}
                          </span>
                          <h3 className="text-xl font-bold text-[#1F2937]">{template.name}</h3>
                       </div>
                       <div className="flex gap-2">
                          <Link href={`/dashboard/templates/${template.id}`} className="p-2 text-[#1F2937]/20 hover:text-[#1F2937] transition-colors"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/dashboard/templates/${template.id}/edit`} className="p-2 text-[#1F2937]/20 hover:text-[#1F2937] transition-colors"><Plus className="w-4 h-4 rotate-45" /></Link>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#1F2937]/5">
                          <p className="text-[10px] font-bold text-[#1F2937]/40 uppercase tracking-widest mb-1">Subject Line</p>
                          <p className="text-sm font-medium text-[#1F2937] truncate">{template.subject}</p>
                       </div>
                       
                       {template.variables.length > 0 && (
                         <div className="flex flex-wrap gap-2">
                            {template.variables.map(v => (
                              <span key={v} className="px-2 py-1 rounded bg-[#1F2937] text-white text-[9px] font-mono">
                                 {v}
                              </span>
                            ))}
                         </div>
                       )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#1F2937]/5 flex justify-between items-center">
                       <span className="text-[9px] font-bold text-[#1F2937]/30 uppercase tracking-widest">Modified {new Date(template.updatedAt).toLocaleDateString()}</span>
                       <button 
                        onClick={() => handleDelete(template.id)}
                        className="text-[9px] font-bold text-red-400 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-opacity cursor-pointer"
                       >
                        Delete
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
