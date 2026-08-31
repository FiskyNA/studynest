'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, FileText, Star, Trash2, Folder, FolderPlus, ChevronRight, X, Tag, Hash, FileUp } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Note { id: string; title: string; content: string; is_pinned: boolean; is_favorite: boolean; folder_id: string | null; tags: string[]; updated_at: string; pdf_url: string | null; }
interface FolderType { id: string; name: string; color: string; }

const folderColors = ['#4c6ef5', '#7950f2', '#e64980', '#f76707', '#12b886', '#15aabf', '#fab005', '#82c91e'];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(folderColors[0]);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [notesRes, foldersRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', user.id).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
      supabase.from('folders').select('*').eq('user_id', user.id).order('name'),
    ]);
    setNotes(notesRes.data || []);
    setFolders(foldersRes.data || []);
    setLoading(false);
  }

  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notes').insert({ user_id: user.id, title: 'Untitled', content: '', folder_id: selectedFolder, tags: [] }).select().single();
    if (data) window.location.href = `/notes/${data.id}`;
  }

  async function deleteNote(id: string) { await supabase.from('notes').delete().eq('id', id); setNotes(notes.filter((n) => n.id !== id)); }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('folders').insert({ user_id: user.id, name: newFolderName, color: newFolderColor }).select().single();
    if (data) { setFolders([...folders, data]); setNewFolderName(''); setShowNewFolder(false); toast.success('Folder created!'); }
  }

  async function deleteFolder(id: string) {
    await supabase.from('folders').delete().eq('id', id);
    await supabase.from('notes').update({ folder_id: null }).eq('folder_id', id);
    setFolders(folders.filter((f) => f.id !== id));
    setNotes(notes.map((n) => n.folder_id === id ? { ...n, folder_id: null } : n));
    if (selectedFolder === id) setSelectedFolder(null);
    toast.success('Folder deleted');
  }

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];

  const filtered = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === null ? true : n.folder_id === selectedFolder;
    const matchesTag = selectedTag === null ? true : (n.tags || []).includes(selectedTag);
    return matchesSearch && matchesFolder && matchesTag;
  });

  return (
    <div className="h-full flex dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto hidden md:flex">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => { setSelectedFolder(null); setSelectedTag(null); }} className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors', !selectedFolder && !selectedTag ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
            All Notes ({notes.length})
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Folders</span>
            <button onClick={() => setShowNewFolder(true)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><FolderPlus className="w-3.5 h-3.5 text-gray-400" /></button>
          </div>
          {showNewFolder && (
            <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createFolder()} placeholder="Folder name" className="w-full text-sm px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded outline-none dark:text-white mb-2" />
              <div className="flex gap-1 mb-2">{folderColors.map((c) => (<button key={c} onClick={() => setNewFolderColor(c)} className={clsx('w-5 h-5 rounded-full', newFolderColor === c && 'ring-2 ring-offset-1 ring-brand-500')} style={{ backgroundColor: c }} />))}</div>
              <div className="flex gap-1"><button onClick={() => setShowNewFolder(false)} className="px-2 py-1 text-xs text-gray-500">Cancel</button><button onClick={createFolder} className="px-2 py-1 text-xs bg-brand-600 text-white rounded">Create</button></div>
            </div>
          )}
          {folders.map((f) => (
            <div key={f.id} className="group flex items-center">
              <button onClick={() => { setSelectedFolder(f.id); setSelectedTag(null); }} className={clsx('flex-1 text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors', selectedFolder === f.id ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: f.color }} />
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{notes.filter((n) => n.folder_id === f.id).length}</span>
              </button>
              <button onClick={() => deleteFolder(f.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400" /></button>
            </div>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button key={tag} onClick={() => { setSelectedTag(selectedTag === tag ? null : tag); setSelectedFolder(null); }} className={clsx('px-2 py-0.5 rounded-full text-xs font-medium transition-colors', selectedTag === tag ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                {selectedFolder ? folders.find((f) => f.id === selectedFolder)?.name || 'Folder' : selectedTag ? `#${selectedTag}` : 'All Notes'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} notes</p>
            </div>
            <button onClick={createNote} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Note</button>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1 dark:text-white" />
            {(selectedFolder || selectedTag) && (
              <button onClick={() => { setSelectedFolder(null); setSelectedTag(null); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
          : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="font-medium dark:text-white">{search ? 'No notes found' : 'No notes yet'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create your first note to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`} className={clsx('group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all', note.is_pinned && 'ring-2 ring-brand-100 dark:ring-brand-800 border-brand-200')}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-1 flex-1 dark:text-white">{note.title}</h3>
                    <div className="flex items-center gap-1">
                      {note.pdf_url && (
                        <span className="flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                          <FileUp className="w-3 h-3" />PDF
                        </span>
                      )}
                      <button onClick={(e) => { e.preventDefault(); deleteNote(note.id); }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{note.pdf_url ? 'PDF document — click to view' : (note.content?.replace(/<[^>]*>/g, '') || 'Empty note...')}</p>
                  {(note.tags && note.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                      {note.tags.length > 3 && <span className="text-[10px] text-gray-400">+{note.tags.length - 3}</span>}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(note.updated_at).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
