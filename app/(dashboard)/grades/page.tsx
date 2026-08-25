'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, GraduationCap, TrendingUp, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Grade { id: string; name: string; subject: string; score: number; max_score: number; date: string; }

const gradeScale = [{ min: 93, g: 'A+' }, { min: 90, g: 'A' }, { min: 87, g: 'A-' }, { min: 83, g: 'B+' }, { min: 80, g: 'B' }, { min: 77, g: 'B-' }, { min: 73, g: 'C+' }, { min: 70, g: 'C' }, { min: 67, g: 'C-' }, { min: 63, g: 'D+' }, { min: 60, g: 'D' }, { min: 0, g: 'F' }];
function getLetter(s: number) { return gradeScale.find((g) => s >= g.min)?.g || 'F'; }
function getGPA(s: number) { const found = gradeScale.find((g) => s >= g.min); const gpas: Record<string, number> = { 'A+': 4, 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2, 'C-': 1.7, 'D+': 1.3, 'D': 1, 'F': 0 }; return gpas[found?.g || 'F'] || 0; }

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', subject: '', score: '', max_score: '100', date: new Date().toISOString().split('T')[0] });
  const supabase = createClient();

  useEffect(() => { loadGrades(); }, []);

  async function loadGrades() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('grades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setGrades(data || []); setLoading(false);
  }

  async function addGrade() {
    if (!form.name.trim() || !form.score) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('grades').insert({ ...form, user_id: user.id, score: parseFloat(form.score), max_score: parseFloat(form.max_score) }).select().single();
    if (data) { setGrades([data, ...grades]); setShowNew(false); setForm({ name: '', subject: '', score: '', max_score: '100', date: new Date().toISOString().split('T')[0] }); toast.success('Grade added!'); }
  }

  async function deleteGrade(id: string) { await supabase.from('grades').delete().eq('id', id); setGrades(grades.filter((g) => g.id !== id)); }

  const subjects = [...new Set(grades.map((g) => g.subject))];
  const subjAvg = subjects.map((s) => { const sg = grades.filter((g) => g.subject === s); const avg = sg.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / sg.length; return { subject: s, average: avg, grade: getLetter(avg) }; });
  const overallGPA = subjAvg.length > 0 ? subjAvg.reduce((sum, s) => sum + getGPA(s.average), 0) / subjAvg.length : 0;
  const overallAvg = grades.length > 0 ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length : 0;

  return (
    <div className="h-full flex flex-col dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold dark:text-white">Grades</h1><p className="text-sm text-gray-500 dark:text-gray-400">{grades.length} grades</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Grade</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-brand-50 dark:bg-brand-900/30 rounded-xl p-4"><p className="text-sm text-brand-600 dark:text-brand-400 font-medium">GPA</p><p className="text-3xl font-bold text-brand-700 dark:text-brand-300">{overallGPA.toFixed(2)}</p></div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4"><p className="text-sm text-green-600 dark:text-green-400 font-medium">Average</p><p className="text-3xl font-bold text-green-700 dark:text-green-300">{overallAvg.toFixed(1)}% <span className="text-lg">{getLetter(overallAvg)}</span></p></div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4"><p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Subjects</p><p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{subjects.length}</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {showNew && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <input autoFocus type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Assignment" className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none dark:text-white" />
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none dark:text-white" />
              <div className="flex gap-2"><input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="Score" className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none dark:text-white" /><span className="flex items-center text-gray-400">/</span><input type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} className="w-16 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none dark:text-white" /></div>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-white" />
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button><button onClick={addGrade} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add</button></div>
          </div>
        )}
        {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : grades.length === 0 ? <div className="flex flex-col items-center justify-center h-64"><GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" /><h3 className="font-medium dark:text-white">No grades yet</h3></div>
        : (
          <div className="space-y-6">
            {subjAvg.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjAvg.map((s) => (<div key={s.subject} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"><div className="flex items-center justify-between"><h3 className="font-medium dark:text-white">{s.subject}</h3><span className="text-2xl font-bold dark:text-white">{s.grade}</span></div><p className="text-sm text-gray-500 dark:text-gray-400">{s.average.toFixed(1)}% average</p></div>))}
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800"><th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th><th className="px-4 py-3" /></tr></thead>
                <tbody>{grades.map((g) => { const pct = (g.score / g.max_score) * 100; return (
                  <tr key={g.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium dark:text-white">{g.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.subject}</td>
                    <td className="px-4 py-3 text-sm dark:text-white">{g.score}/{g.max_score} ({pct.toFixed(0)}%)</td>
                    <td className="px-4 py-3"><span className={clsx('px-2 py-1 rounded-full text-xs font-bold', pct >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : pct >= 80 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : pct >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')}>{getLetter(pct)}</span></td>
                    <td className="px-4 py-3"><button onClick={() => deleteGrade(g.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );})}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
