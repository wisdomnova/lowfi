/**
 * Email Content Editor Component
 * Tactical payload composer for campaign transmission.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { AlertCircle, Eye, Edit3, Terminal, Activity, CheckCircle2 } from 'lucide-react';
import { substituteMergeTags, extractMergeTags } from '@/lib/merge-tags';
import { RichTextEditor } from './RichTextEditor';

export interface EmailEditorProps {
  subject: string;
  onSubjectChange: (subject: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  preheader?: string;
  onPreheaderChange?: (preheader: string) => void;
  mergeTags?: string[];
  errors?: Record<string, string>;
  showPreview?: boolean;
}

export function EmailContentEditor({
  subject,
  onSubjectChange,
  content,
  onContentChange,
  preheader = '',
  onPreheaderChange,
  mergeTags = [],
  errors = {},
  showPreview = true,
}: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const subjectError = errors?.subject;
  const contentError = errors?.content;

  // Get merge tag suggestions from content
  const tagsInContent = extractMergeTags(content);

  // Generate preview with sample data
  const generatePreview = useCallback(() => {
    const sampleData: Record<string, string> = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
      phone: '(555) 123-4567',
    };

    // Add additional merge tags with sample values
    mergeTags.forEach((tag) => {
      if (!sampleData[tag]) {
        sampleData[tag] = `{${tag}}`;
      }
    });

    return {
      subject: substituteMergeTags(subject, sampleData),
      content: substituteMergeTags(content, sampleData),
    };
  }, [subject, content, mergeTags]);

  const preview_content = generatePreview();

  return (
    <div className="space-y-8">
      {/* Parameter Grid (Subject & Preheader) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Line */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Subject Line</label>
            <span className={`text-[9px] font-mono ${subject.length > 90 ? 'text-red-500' : 'text-slate-400'}`}>
              {subject.length}/100
            </span>
          </div>
          <div className={`flex items-center bg-white border rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group mx-1 ${
            subjectError ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB]'
          }`}>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Enter email subject line..."
              maxLength={100}
              className="flex-1 bg-transparent border-none px-4 font-black text-[13px] tracking-tight outline-none focus:ring-0 placeholder:text-slate-300"
            />
            {subjectError && (
              <div className="text-red-500 pr-2">
                <AlertCircle size={18} />
              </div>
            )}
          </div>
          {subjectError && <p className="px-2 text-[10px] font-black uppercase text-red-600 tracking-wider">! Error: {subjectError}</p>}
        </div>

        {/* Preheader */}
        {onPreheaderChange && (
          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Preview Text</label>
              <span className={`text-[9px] font-mono ${preheader.length > 140 ? 'text-red-500' : 'text-slate-400'}`}>
                {preheader.length}/150
              </span>
            </div>
            <div className="flex items-center px-4 bg-white border border-[#E5E7EB] rounded-2xl h-14 transition-all focus-within:border-[#1F2937] group mx-1">
              <input
                type="text"
                value={preheader}
                onChange={(e) => onPreheaderChange(e.target.value)}
                placeholder="Brief inbox preview text..."
                maxLength={150}
                className="flex-1 bg-transparent border-none px-4 font-black text-[13px] tracking-tight outline-none focus:ring-0 placeholder:text-slate-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor/Preview Controls */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'edit'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Mode
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
          </div>
        </div>
      </div>

      {/* Main Surface */}
      <div className="min-h-[500px]">
        {activeTab === 'edit' ? (
          <div className="space-y-6">
            <div className="relative">
              <RichTextEditor
                value={content}
                onChange={onContentChange}
                placeholder="Write your email message..."
                minHeight="450px"
                mergeTagHints={['first_name', 'last_name', 'email', 'company']}
              />
              {contentError && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{contentError}</span>
                </div>
              )}
            </div>

            {/* Merge Tags */}
            {tagsInContent.length > 0 && (
              <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Merge Tags in Use</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsInContent.map((tag) => (
                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <code className="text-[11px] font-bold text-slate-900 font-mono">
                        {`{${tag}}`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#1F2937] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
              
              {/* Preview Header */}
              <div className="space-y-4 mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-1">Subject Line</span>
                    <h4 className="text-white font-bold tracking-tight">{preview_content.subject}</h4>
                  </div>
                </div>
                {preheader && (
                  <div className="pl-14">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Preview Text</span>
                    <p className="text-white/40 text-xs italic">"{preheader}"</p>
                  </div>
                )}
              </div>

              {/* Preview Body */}
              <div className="bg-white rounded-[2rem] p-10 min-h-[400px]">
                <div 
                  className="prose prose-slate max-w-none text-[#1F2937]"
                  dangerouslySetInnerHTML={{ __html: preview_content.content }}
                />
              </div>

              {/* Preview Footer */}
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Preview Ready</span>
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Draft Preview</span>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                Note: This preview uses sample data. When you send the campaign, real recipient details will be filled in automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
