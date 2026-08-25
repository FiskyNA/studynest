'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckSquare, Calendar, Brain, GraduationCap, Timer, Settings, Plus } from 'lucide-react';
import clsx from 'clsx';

const commands = [
  { label: 'New Note', icon: Plus, action: '/notes', shortcut: 'Ctrl+N' },
  { label: 'Notes', icon: FileText, action: '/notes' },
  { label: 'Tasks', icon: CheckSquare, action: '/tasks' },
  { label: 'Schedule', icon: Calendar, action: '/schedule' },
  { label: 'Flashcards', icon: Brain, action: '/flashcards' },
  { label: 'Grades', icon: GraduationCap, action: '/grades' },
  { label: 'Study Tools', icon: Timer, action: '/study' },
  { label: 'Settings', icon: Settings, action: '/settings' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { if (open) { setQuery(''); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIdx]) { router.push(filtered[selectedIdx].action); onClose(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, filtered, selectedIdx, onClose, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command..." className="flex-1 bg-transparent outline-none text-sm" />
          <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto py-2">
          {filtered.map((cmd, i) => (
            <button key={cmd.label} onClick={() => { router.push(cmd.action); onClose(); }} className={clsx('flex items-center gap-3 w-full px-4 py-2.5 text-sm', i === selectedIdx ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')}>
              <cmd.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{cmd.shortcut}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No results</p>}
        </div>
      </div>
    </div>
  );
}
