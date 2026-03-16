"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Link2Off,
  Heading1,
  Heading2,
  Quote,
  Terminal,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  mergeTagHints?: string[];
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter your email content...",
  minHeight = "300px",
  mergeTagHints = [],
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!isMounted) {
    return (
      <div
        style={{ minHeight }}
        className="w-full px-8 py-6 rounded-[2rem] border-2 border-[#E5E7EB] bg-white animate-pulse"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="w-8 h-8 bg-gray-100 rounded-lg" />
           <div className="w-32 h-4 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-4">
           <div className="w-full h-4 bg-gray-50 rounded-full" />
           <div className="w-5/6 h-4 bg-gray-50 rounded-full" />
        </div>
      </div>
    );
  }

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleHeading1 = () =>
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleHeading2 = () =>
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () =>
    editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () =>
    editor?.chain().focus().toggleBlockquote().run();

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const unsetLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const insertMergeTag = (tag: string) => {
    editor?.chain().focus().insertContent(`{{${tag}}}`).run();
  };

  return (
    <div className="w-full border border-[#E5E7EB] rounded-[2.5rem] bg-white overflow-hidden transition-all focus-within:border-[#1F2937] group mx-1">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-6 bg-[#FAFAF8] border-b border-[#E5E7EB] items-center">
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={toggleBold}
            className={`p-2 rounded-lg transition-all ${
              editor?.isActive("bold") ? "bg-[#1F2937] text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </button>

          <button
            onClick={toggleItalic}
            className={`p-2 rounded-lg transition-all ${
              editor?.isActive("italic") ? "bg-[#1F2937] text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={toggleHeading1}
            className={`px-3 py-2 rounded-lg text-[10px] font-black tracking-tighter transition-all ${
              editor?.isActive("heading", { level: 1 })
                ? "bg-[#1F2937] text-white shadow-lg"
                : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            onClick={toggleHeading2}
            className={`px-3 py-2 rounded-lg text-[10px] font-black tracking-tighter transition-all ${
              editor?.isActive("heading", { level: 2 })
                ? "bg-[#1F2937] text-white shadow-lg"
                : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Heading 2"
          >
            H2
          </button>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={toggleBulletList}
            className={`p-2 rounded-lg transition-all ${
              editor?.isActive("bulletList") ? "bg-[#1F2937] text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Bullet List"
          >
            <List size={14} />
          </button>

          <button
            onClick={toggleOrderedList}
            className={`p-2 rounded-lg transition-all ${
              editor?.isActive("orderedList") ? "bg-[#1F2937] text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </button>
        </div>

        <button
          onClick={toggleBlockquote}
          className={`p-2 rounded-lg transition-all ${
            editor?.isActive("blockquote") ? "bg-[#1F2937] text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937] border border-[#E5E7EB]"
          }`}
          title="Quote"
        >
          <Quote size={14} />
        </button>

        <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={setLink}
            className={`p-2 rounded-lg transition-all ${
              editor?.isActive("link") ? "bg-blue-600 text-white shadow-lg" : "hover:bg-gray-100 text-[#1F2937]"
            }`}
            title="Add Link"
          >
            <LinkIcon size={14} />
          </button>

          <button
            onClick={unsetLink}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#1F2937] transition-all"
            title="Remove Link"
          >
            <Link2Off size={14} />
          </button>
        </div>

        {mergeTagHints.length > 0 && (
          <div className="flex-1 flex items-center justify-end gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">
               <Terminal className="w-3 h-3" />
               Insert Tag:
            </div>
            <div className="flex flex-wrap gap-2">
              {mergeTagHints.map((tag) => (
                <button
                  key={tag}
                  onClick={() => insertMergeTag(tag)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Container */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none"
        />
        {editor && editor.isEmpty && (
           <div className="absolute top-8 left-8 text-[#CED4DA] text-lg font-medium pointer-events-none italic">
             {placeholder}
           </div>
        )}
      </div>

      <style jsx global>{`
        .ProseMirror {
          padding: 32px;
          outline: none;
          min-height: ${minHeight};
          font-family: inherit;
          font-size: 16px;
          line-height: 1.8;
          color: #1F2937;
        }

        .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          margin: 1.5em 0 0.5em 0;
          color: #111827;
        }

        .ProseMirror h2 {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 1.5em 0 0.5em 0;
          color: #111827;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }

        .ProseMirror li {
           margin-bottom: 0.5em;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #1F2937;
          background: #FAFAF8;
          padding: 1.5rem 2rem;
          border-radius: 0 1.5rem 1.5rem 0;
          margin: 2em 0;
          font-style: normal;
          font-weight: 500;
          color: #4B5563;
        }

        .ProseMirror a {
          color: #2563EB;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
        }

        .ProseMirror p {
          margin: 1em 0;
        }

        .ProseMirror code {
          background-color: #F3F4F6;
          padding: 0.2em 0.5em;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 600;
          color: #DC2626;
        }

        .ProseMirror pre {
          background-color: #1F2937;
          color: #F9FAFB;
          padding: 2rem;
          border-radius: 1.5rem;
          overflow-x: auto;
          margin: 2em 0;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
