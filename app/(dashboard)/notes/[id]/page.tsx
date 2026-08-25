'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import { ArrowLeft, Bold, Italic, Code, Heading1, Heading2, List, ListOrdered, ListChecks, Quote, Minus, CodeSquare, Highlighter, Undo, Redo, Save, Star } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const lowlight = createLowlight(common);

function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); };
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const supabase = createClient();

  const autoSave = useCallback(
    debounce(async (content: string) => {
      setSaving(true);
      await supabase.from('notes').update({ title, content, updated_at: new Date().toISOString() }).eq('id', noteId);
      setLastSaved(new Date()); setSaving(false);
    }, 1000), [title, noteId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Highlight, TaskList, TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      LinkExtension.configure({ openOnClick: false }),
      Image,
    ],
    content: '',
    editorProps: { attributes: { class: 'prose prose-lg max-w-none focus:outline-none min-h-[50vh] dark:text-white' } },
    onUpdate: ({ editor }) => { autoSave(editor.getHTML()); },
  });

  useEffect(() => { loadNote(); }, [noteId]);

  async function loadNote() {
    const { data } = await supabase.from('notes').select('*').eq('id', noteId).single();
    if (data) { setTitle(data.title); setIsFavorite(data.is_favorite); if (editor && data.content) editor.commands.setContent(data.content); }
    setLoading(false);
  }

  async function saveNote() {
    if (!editor) return;
    setSaving(true);
    const { error } = await supabase.from('notes').update({ title, content: editor.getHTML(), updated_at: new Date().toISOString() }).eq('id', noteId);
    if (error) toast.error('Failed to save'); else { setLastSaved(new Date()); toast.success('Saved!'); }
    setSaving(false);
  }

  async function toggleFavorite() {
    const v = !isFavorite; setIsFavorite(v);
    await supabase.from('notes').update({ is_favorite: v }).eq('id', noteId);
  }

  if (loading) return <div className="flex items-center justify-center h-full dark:bg-gray-950"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/notes')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ArrowLeft className="w-4 h-4 dark:text-gray-400" /></button>
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
          {!saving && lastSaved && <span className="text-xs text-gray-400">Saved {lastSaved.toLocaleTimeString()}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleFavorite} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Star className={clsx('w-4 h-4', isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400')} /></button>
          <button onClick={saveNote} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Save className="w-3.5 h-3.5" />Save</button>
        </div>
      </div>
      {editor && (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          <TB icon={<Bold className="w-4 h-4" />} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
          <TB icon={<Italic className="w-4 h-4" />} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <TB icon={<Code className="w-4 h-4" />} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
          <TB icon={<Highlighter className="w-4 h-4" />} active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <TB icon={<Heading1 className="w-4 h-4" />} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <TB icon={<Heading2 className="w-4 h-4" />} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <TB icon={<List className="w-4 h-4" />} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <TB icon={<ListOrdered className="w-4 h-4" />} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <TB icon={<ListChecks className="w-4 h-4" />} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <TB icon={<Quote className="w-4 h-4" />} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <TB icon={<CodeSquare className="w-4 h-4" />} active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
          <TB icon={<Minus className="w-4 h-4" />} active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <TB icon={<Undo className="w-4 h-4" />} active={false} onClick={() => editor.chain().focus().undo().run()} />
          <TB icon={<Redo className="w-4 h-4" />} active={false} onClick={() => editor.chain().focus().redo().run()} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" className="w-full text-4xl font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 mb-6 dark:text-white dark:bg-transparent" />
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>
    </div>
  );
}

function TB({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={clsx('p-1.5 rounded-md transition-colors', active ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>{icon}</button>;
}
