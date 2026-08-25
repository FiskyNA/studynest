'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, FileText, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Note { id: string; title: string; content: string; is_pinned: boolean; is_favorite: boolean; updated_at: string; }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });
    setNotes(data || []); setLoading(false);
  }

  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notes').insert({ user_id: user.id, title: 'Untitled', content: '' }).select().single();
    if (data) window.location.href = `/notes/${data.id}`;
  }

  async function deleteNote(id: string) { await supabase.from('notes').delete().eq('id', id); setNotes(notes.filter((n) => n.id !== id)); }

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold dark:text-white">Notes</h1><p className="text-sm text-gray-500 dark:text-gray-400">{notes.length} notes</p></div>
          <button onClick={createNote} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Note</button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"><Search className="w-4 h-4 text-gray-400" /><input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1 dark:text-white" /></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64"><FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" /><h3 className="font-medium dark:text-white">{search ? 'No notes found' : 'No notes yet'}</h3><p className="text-sm text-gray-500 dark:text-gray-400">Create your first note to get started</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className={clsx('group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all', note.is_pinned && 'ring-2 ring-brand-100 dark:ring-brand-800 border-brand-200')}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-1 flex-1 dark:text-white">{note.title}</h3>
                  <button onClick={(e) => { e.preventDefault(); deleteNote(note.id); }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{note.content || 'Empty note...'}</p>
                <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(note.updated_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
