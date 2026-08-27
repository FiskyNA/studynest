'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Grade { id: string; course: string; score: number; max_score: number; weight: number; type: string; date: string; notes: string; }
interface TrendData { month: string; average: number; highest: number; lowest: number; }

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCourse, setNewCourse] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newWeight, setNewWeight] = useState('1');
  const [newType, setNewType] = useState('assignment');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => { loadGrades(); }, []);

  async function loadGrades() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('grades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (data) { setGrades(data); computeTrends(data); }
    setLoading(false);
  }

  function computeTrends(data: Grade[]) {
    const monthMap = new Map<string, { scores: number[] }>();
    data.forEach((g) => {
      const d = new Date(g.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) monthMap.set(key, { scores: [] });
      monthMap.get(key)!.scores.push((g.score / g.max_score) * 100);
    });
    const trends: TrendData[] = [];
    monthMap.forEach((val, key) => {
      const avg = val.scores.reduce((a, b) => a + b, 0) / val.scores.length;
      trends.push({ month: key, average: Math.round(avg * 10) / 10, highest: Math.round(Math.max(...val.scores) * 10) / 10, lowest: Math.round(Math.min(...val.scores) * 10) / 10 });
    });
    setTrendData(trends.sort((a, b) => a.month.localeCompare(b.month)));
  }

  async function addGrade() {
    if (!newCourse.trim() || !newScore) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('grades').insert({ user_id: user.id, course: newCourse, score: parseFloat(newScore), max_score: parseFloat(newMaxScore), weight: parseFloat(newWeight), type: newType, date: newDate, notes: newNotes }).select().single();
    if (data) { setGrades([data, ...grades]); computeTrends([data, ...grades]); setShowNew(false); setNewScore(''); setNewNotes(''); toast.success('Grade added!'); }
  }

  async function deleteGrade(id: string) {
    await supabase.from('grades').delete().eq('id', id);
    const updated = grades.filter((g) => g.id !== id);
    setGrades(updated); computeTrends(updated);
  }

  const courseAverages = grades.reduce<Record<string, { total: number; weight: number }>>((acc, g) => {
    const pct = (g.score / g.max_score) * 100;
    if (!acc[g.course]) acc[g.course] = { total: 0, weight: 0 };
    acc[g.course].total += pct * g.weight;
    acc[g.course].weight += g.weight;
    return acc;
  }, {});

  const filtered = selectedCourse === 'all' ? grades : grades.filter((g) => g.course === selectedCourse);
  const courses = [...new Set(grades.map((g) => g.course))];
  const overallAvg = grades.length > 0 ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length : 0;

  return (
    <div className="h-full overflow-y-auto p-6 dark:bg-gray-950">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Grades</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your academic performance</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700">+ Add Grade</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-75">Overall Average</p>
          <p className="text-3xl font-bold mt-1">{overallAvg.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Grades</p>
          <p className="text-3xl font-bold dark:text-white mt-1">{grades.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
          <p className="text-3xl font-bold dark:text-white mt-1">{courses.length}</p>
        </div>
      </div>

      {trendData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Grade Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px', color: '#F3F4F6' }} />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#6366F1" strokeWidth={2} name="Average %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="highest" stroke="#10B981" strokeWidth={1.5} name="Highest %" dot={{ r: 3 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="lowest" stroke="#EF4444" strokeWidth={1.5} name="Lowest %" dot={{ r: 3 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Course Averages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(courseAverages).map(([course, data]) => {
              const avg = data.total / data.weight;
              return (
                <div key={course} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="font-medium dark:text-white text-sm truncate">{course}</span>
                  <span className={clsx('font-bold text-sm', avg >= 90 ? 'text-green-600 dark:text-green-400' : avg >= 80 ? 'text-blue-600 dark:text-blue-400' : avg >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400')}>
                    {avg.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNew && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Add Grade</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input type="text" placeholder="Course" value={newCourse} onChange={(e) => setNewCourse(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
            <input type="number" placeholder="Score" value={newScore} onChange={(e) => setNewScore(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
            <input type="number" placeholder="Max" value={newMaxScore} onChange={(e) => setNewMaxScore(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
            <input type="number" placeholder="Weight" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white">
              <option value="assignment">Assignment</option><option value="exam">Exam</option><option value="quiz">Quiz</option><option value="project">Project</option><option value="participation">Participation</option>
            </select>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
            <input type="text" placeholder="Notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <button onClick={addGrade} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700">Add</button>
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setSelectedCourse('all')} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', selectedCourse === 'all' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>All Courses</button>
          {courses.map((c) => (
            <button key={c} onClick={() => setSelectedCourse(c)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', selectedCourse === c ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>{c}</button>
          ))}
        </div>
      )}

      {loading ? <div className="flex justify-center h-32"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
      : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No grades yet. Add your first grade!</p></div>
      : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800"><tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((g) => {
                const pct = (g.score / g.max_score) * 100;
                return (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium dark:text-white">{g.course}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.score}/{g.max_score}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', pct >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : pct >= 80 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : pct >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{g.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(g.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><button onClick={() => deleteGrade(g.id)} className="text-gray-400 hover:text-red-500 text-sm">Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
