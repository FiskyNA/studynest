'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface ClassSchedule { id: string; name: string; instructor: string; location: string; day_of_week: number; start_time: string; end_time: string; color: string; }

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 14 }, (_, i) => i + 7);
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'];

export default function SchedulePage() {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', instructor: '', location: '', day_of_week: 0, start_time: '09:00', end_time: '10:30', color: colors[0] });
  const supabase = createClient();

  useEffect(() => { loadClasses(); }, []);

  async function loadClasses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('schedule').select('*').eq('user_id', user.id).order('day_of_week');
    setClasses(data || []); setLoading(false);
  }

  async function addClass() {
    if (!form.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('schedule').insert({ ...form, user_id: user.id }).select().single();
    if (data) { setClasses([...classes, data]); setShowNew(false); setForm({ name: '', instructor: '', location: '', day_of_week: 0, start_time: '09:00', end_time: '10:30', color: colors[0] }); toast.success('Class added!'); }
  }

  async function deleteClass(id: string) { await supabase.from('schedule').delete().eq('id', id); setClasses(classes.filter((c) => c.id !== id)); }

  function getPos(time: string) { const [h, m] = time.split(':').map(Number); return ((h - 7) * 60 + m) / (14 * 60) * 100; }
  function getHeight(s: string, e: string) { return getPos(e) - getPos(s); }

  return (
    <div className="h-full flex flex-col dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold dark:text-white">Schedule</h1><p className="text-sm text-gray-500 dark:text-gray-400">{classes.length} classes</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Class</button>
        </div>
      </div>
      {showNew && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px]"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Class Name</label><input autoFocus type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Calculus II" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:text-white" /></div>
            <div className="flex-1 min-w-[120px]"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Day</label><select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white">{days.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start</label><input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white" /></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End</label><input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white" /></div>
            <div className="flex gap-2"><button onClick={() => setShowNew(false)} className="px-3 py-2 text-sm text-gray-500">Cancel</button><button onClick={addClass} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add</button></div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto p-6">
        {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : classes.length === 0 ? <div className="flex flex-col items-center justify-center h-64"><p className="text-gray-500 dark:text-gray-400">No classes scheduled yet</p></div>
        : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700">
              <div className="p-2" />
              {days.map((d) => <div key={d} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-l border-gray-100 dark:border-gray-800">{d}</div>)}
            </div>
            <div className="grid grid-cols-[60px_repeat(7,1fr)] relative" style={{ height: '700px' }}>
              <div>{hours.map((h) => <div key={h} className="h-[50px] border-b border-gray-50 dark:border-gray-800 flex items-start justify-end pr-2 pt-0.5"><span className="text-xs text-gray-400 dark:text-gray-500">{h}:00</span></div>)}</div>
              {days.map((_, di) => (
                <div key={di} className="relative border-l border-gray-100 dark:border-gray-800">
                  {hours.map((h) => <div key={h} className="h-[50px] border-b border-gray-50 dark:border-gray-800" />)}
                  {classes.filter((c) => c.day_of_week === di).map((cls) => (
                    <div key={cls.id} className={clsx('absolute left-1 right-1 rounded-lg p-2 text-white text-xs overflow-hidden group cursor-pointer', cls.color)} style={{ top: `${getPos(cls.start_time)}%`, height: `${getHeight(cls.start_time, cls.end_time)}%` }}>
                      <div className="font-semibold truncate">{cls.name}</div>
                      {cls.instructor && <div className="opacity-80 truncate">{cls.instructor}</div>}
                      <button onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }} className="absolute top-1 right-1 p-1 rounded bg-black/20 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
