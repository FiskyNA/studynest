'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, CheckCircle2, Circle, Trash2, Clock, AlertCircle, LayoutGrid, List, GripVertical, Repeat } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Task { id: string; title: string; completed: boolean; priority: 'low' | 'medium' | 'high'; due_date: string | null; subject: string; recurring: string | null; }

type ViewMode = 'list' | 'kanban';
type KanbanColumn = 'todo' | 'in-progress' | 'done';

const columns: { id: KanbanColumn; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  { id: 'done', label: 'Done', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
];

const recurringOptions = [
  { value: '', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newRecurring, setNewRecurring] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
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
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, title: newTitle, priority: newPriority, due_date: newDueDate || null, subject: newSubject, recurring: newRecurring || null, completed: false }).select().single();
    if (data) { setTasks([data, ...tasks]); setNewTitle(''); setShowNew(false); setNewRecurring(''); toast.success('Task added!'); }
  }

  async function toggleTask(id: string, completed: boolean, task: Task) {
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id);

    if (!completed && task.recurring && task.due_date) {
      const nextDate = getNextDate(task.due_date, task.recurring);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('tasks').insert({ user_id: user.id, title: task.title, priority: task.priority, due_date: nextDate, subject: task.subject, recurring: task.recurring, completed: false });
      }
    }

    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !completed } : t));
  }

  async function deleteTask(id: string) { await supabase.from('tasks').delete().eq('id', id); setTasks(tasks.filter((t) => t.id !== id)); }

  function getNextDate(dateStr: string, recurring: string): string {
    const d = new Date(dateStr);
    switch (recurring) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
    }
    return d.toISOString().split('T')[0];
  }

  function handleDragStart(e: React.DragEvent, taskId: string) { setDraggedTask(taskId); e.dataTransfer.effectAllowed = 'move'; }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
  async function handleDrop(e: React.DragEvent, column: KanbanColumn) {
    e.preventDefault();
    if (!draggedTask) return;
    const completed = column === 'done';
    await supabase.from('tasks').update({ completed }).eq('id', draggedTask);
    setTasks(tasks.map((t) => t.id === draggedTask ? { ...t, completed } : t));
    setDraggedTask(null);
  }

  function getTasksForColumn(col: KanbanColumn) {
    return tasks.filter((t) => {
      if (col === 'todo') return !t.completed;
      if (col === 'done') return t.completed;
      return !t.completed && t.priority === 'high';
    });
  }

  const filtered = tasks.filter((t) => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true);
  const prios: Record<string, { color: string; icon: React.ReactNode }> = { low: { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: <Clock className="w-3 h-3" /> }, medium: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" /> }, high: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: <AlertCircle className="w-3 h-3" /> } };

  return (
    <div className="h-full flex flex-col dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold dark:text-white">Tasks</h1><p className="text-sm text-gray-500 dark:text-gray-400">{tasks.filter((t) => !t.completed).length} active · {tasks.filter((t) => t.completed).length} done</p></div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setView('list')} className={clsx('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500')}><List className="w-4 h-4" /></button>
              <button onClick={() => setView('kanban')} className={clsx('p-1.5 rounded-md transition-colors', view === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500')}><LayoutGrid className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Task</button>
          </div>
        </div>
        {view === 'list' && (
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', filter === f ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {showNew && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 shadow-sm">
            <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="What needs to be done?" className="w-full text-lg outline-none mb-3 dark:text-white dark:bg-transparent" />
            <div className="flex items-center gap-3 flex-wrap">
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
              <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white" />
              <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject" className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white" />
              <select value={newRecurring} onChange={(e) => setNewRecurring(e.target.value)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white">
                {recurringOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex-1" />
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
              <button onClick={addTask} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add</button>
            </div>
          </div>
        )}
        {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : view === 'kanban' ? (
          <div className="grid grid-cols-3 gap-4 h-full">
            {columns.map((col) => (
              <div key={col.id} className="flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={clsx('px-2 py-1 rounded-md text-xs font-medium', col.color)}>{col.label}</span>
                  <span className="text-xs text-gray-400">{getTasksForColumn(col.id).length}</span>
                </div>
                <div className="flex-1 space-y-2 min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-xl p-2 border border-gray-100 dark:border-gray-800">
                  {getTasksForColumn(col.id).map((task) => (
                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className={clsx('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all', draggedTask === task.id && 'opacity-50')}>
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium dark:text-white truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {task.subject && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">{task.subject}</span>}
                            {task.due_date && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">{new Date(task.due_date).toLocaleDateString()}</span>}
                            {task.recurring && <span className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Repeat className="w-2.5 h-2.5" />{task.recurring}</span>}
                            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-medium', prios[task.priority].color)}>{task.priority}</span>
                          </div>
                        </div>
                        <button onClick={() => toggleTask(task.id, task.completed, task)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? <div className="flex flex-col items-center justify-center h-64"><CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" /><h3 className="font-medium dark:text-white">No tasks</h3></div>
        : (
          <div className="space-y-2">
            {filtered.map((task) => {
              const overdue = !task.completed && task.due_date && new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className={clsx('flex items-center gap-3 bg-white dark:bg-gray-900 border rounded-xl p-4 group hover:shadow-sm transition-all', task.completed ? 'border-gray-100 dark:border-gray-800 opacity-60' : 'border-gray-200 dark:border-gray-700', overdue && 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10')}>
                  <button onClick={() => toggleTask(task.id, task.completed, task)} className="flex-shrink-0">
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-brand-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('font-medium dark:text-white', task.completed && 'line-through text-gray-400 dark:text-gray-500')}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {task.subject && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{task.subject}</span>}
                      {task.due_date && <span className={clsx('text-xs px-2 py-0.5 rounded', overdue ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400')}>{new Date(task.due_date).toLocaleDateString()}</span>}
                      {task.recurring && <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded flex items-center gap-1"><Repeat className="w-3 h-3" />{task.recurring}</span>}
                    </div>
                  </div>
                  <span className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', prios[task.priority].color)}>{prios[task.priority].icon}{task.priority}</span>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
