'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, FileText, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export function QuickCapture({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'note' | 'task'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function save() {
    if (!title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    if (type === 'note') {
      const { data } = await supabase.from('notes').insert({ user_id: user.id, title, content: content || '<p></p>', tags: [] }).select().single();
      if (data) { toast.success('Note created!'); onClose(); }
    } else {
      const { data } = await supabase.from('tasks').insert({ user_id: user.id, title, priority: 'medium', subject: '', completed: false }).select().single();
      if (data) { toast.success('Task created!'); onClose(); }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Quick Capture</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setType('note')} className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', type === 'note' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
            <FileText className="w-4 h-4" />Note
          </button>
          <button onClick={() => setType('task')} className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', type === 'task' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
            <CheckSquare className="w-4 h-4" />Task
          </button>
        </div>
        <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder={type === 'note' ? 'Note title...' : 'Task title...'} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 mb-3" />
        {type === 'note' && <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 resize-none h-24 mb-3" />}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
