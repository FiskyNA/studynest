'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, CheckCircle2, Circle, Trash2, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Task { id: string; title: string; completed: boolean; priority: 'low' | 'medium' | 'high'; due_date: string | null; subject: string; }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('completed').order('due_date');
    setTasks(data || []); setLoading(false);
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, title: newTitle, priority: newPriority, due_date: newDueDate || null, subject: newSubject, completed: false }).select().single();
    if (data) { setTasks([data, ...tasks]); setNewTitle(''); setShowNew(false); toast.success('Task added!'); }
  }

  async function toggleTask(id: string, completed: boolean) {
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id);
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !completed } : t));
  }

  async function deleteTask(id: string) { await supabase.from('tasks').delete().eq('id', id); setTasks(tasks.filter((t) => t.id !== id)); }

  const filtered = tasks.filter((t) => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true);
  const prios: Record<string, { color: string; icon: React.ReactNode }> = { low: { color: 'bg-green-100 text-green-700', icon: <Clock className="w-3 h-3" /> }, medium: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> }, high: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> } };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold">Tasks</h1><p className="text-sm text-gray-500">{tasks.filter((t) => !t.completed).length} active · {tasks.filter((t) => t.completed).length} done</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Task</button>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', filter === f ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {showNew && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="What needs to be done?" className="w-full text-lg outline-none mb-3" />
            <div className="flex items-center gap-3 flex-wrap">
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
              <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <div className="flex-1" />
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
              <button onClick={addTask} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add</button>
            </div>
          </div>
        )}
        {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : filtered.length === 0 ? <div className="flex flex-col items-center justify-center h-64"><CheckCircle2 className="w-12 h-12 text-gray-300 mb-4" /><h3 className="font-medium">No tasks</h3></div>
        : (
          <div className="space-y-2">
            {filtered.map((task) => {
              const overdue = !task.completed && task.due_date && new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className={clsx('flex items-center gap-3 bg-white border rounded-xl p-4 group hover:shadow-sm transition-all', task.completed ? 'border-gray-100 opacity-60' : 'border-gray-200', overdue && 'border-red-200 bg-red-50')}>
                  <button onClick={() => toggleTask(task.id, task.completed)} className="flex-shrink-0">
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300 hover:text-brand-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('font-medium', task.completed && 'line-through text-gray-400')}>{task.title}</p>
                    {(task.subject || task.due_date) && (
                      <div className="flex items-center gap-2 mt-1">
                        {task.subject && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{task.subject}</span>}
                        {task.due_date && <span className={clsx('text-xs px-2 py-0.5 rounded', overdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600')}>{new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                  <span className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', prios[task.priority].color)}>{prios[task.priority].icon}{task.priority}</span>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
