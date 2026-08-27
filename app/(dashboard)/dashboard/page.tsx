'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, CheckSquare, Calendar, Brain, GraduationCap, Clock, Flame, BookOpen, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Profile { full_name: string; university: string; major: string; }
interface Note { id: string; title: string; updated_at: string; }
interface Task { id: string; title: string; completed: boolean; priority: string; due_date: string | null; }
interface Grade { id: string; subject: string; score: number; max_score: number; }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getLetter(s: number) {
  if (s >= 93) return 'A+';
  if (s >= 90) return 'A';
  if (s >= 87) return 'A-';
  if (s >= 83) return 'B+';
  if (s >= 80) return 'B';
  if (s >= 77) return 'B-';
  if (s >= 73) return 'C+';
  if (s >= 70) return 'C';
  return 'C-';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, notesRes, tasksRes, gradesRes] = await Promise.all([
      supabase.from('profiles').select('full_name, university, major').eq('id', user.id).single(),
      supabase.from('notes').select('id, title, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
      supabase.from('tasks').select('id, title, completed, priority, due_date').eq('user_id', user.id),
      supabase.from('grades').select('id, subject, score, max_score').eq('user_id', user.id),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (notesRes.data) setRecentNotes(notesRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (gradesRes.data) setGrades(gradesRes.data);
    setLoading(false);
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = activeTasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());
  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const subjects = [...new Set(grades.map((g) => g.subject))];
  const avgGPA = subjects.length > 0
    ? subjects.reduce((sum, s) => {
        const sg = grades.filter((g) => g.subject === s);
        const avg = sg.reduce((a, g) => a + (g.score / g.max_score) * 100, 0) / sg.length;
        const gpas: Record<string, number> = { 'A+': 4, 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2 };
        return sum + (gpas[getLetter(avg)] || 0);
      }, 0) / subjects.length
    : 0;

  const upcomingDeadlines = activeTasks
    .filter((t) => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  if (loading) return null;

  return (
    <div className="h-full overflow-y-auto dark:bg-gray-950">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto p-6"
      >
        <motion.div variants={item} className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white mb-1">
            {getGreeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {profile?.university ? `${profile.university}` : 'Your study dashboard'}
            {profile?.major ? ` · ${profile.major}` : ''}
          </p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<CheckSquare className="w-5 h-5" />} label="Active Tasks" value={activeTasks.length} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/30" />
          <StatCard icon={<Flame className="w-5 h-5" />} label="Completion Rate" value={`${completionRate}%`} color="text-green-600 dark:text-green-400" bg="bg-green-50 dark:bg-green-900/30" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="GPA" value={avgGPA.toFixed(2)} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/30" />
          <StatCard icon={<FileText className="w-5 h-5" />} label="Notes" value={recentNotes.length} color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/30" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={item} className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-600" />Upcoming Deadlines
                </h2>
                <Link href="/tasks" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No upcoming deadlines</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.map((task) => {
                    const days = Math.ceil((new Date(task.due_date!).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={task.id} className="flex items-center gap-3 py-2">
                        <div className={clsx('w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0', days <= 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : days <= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400')}>
                          <span className="text-sm font-bold leading-none">{days}</span>
                          <span className="text-[9px] leading-none">d</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate dark:text-white">{task.title}</p>
                        </div>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full', task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400')}>
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />Recent Notes
                </h2>
                <Link href="/notes" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentNotes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No notes yet</p>
                  <Link href="/notes" className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium">
                    <Plus className="w-4 h-4" />Create your first note
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <Link key={note.id} href={`/notes/${note.id}`} className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 -mx-2 transition-colors">
                      <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-white">{note.title}</p>
                        <p className="text-xs text-gray-400">{new Date(note.updated_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickLink href="/notes" icon={<FileText className="w-6 h-6" />} title="Open Notes" desc="Write and organize" color="from-blue-500 to-cyan-500" />
          <QuickLink href="/tasks" icon={<CheckSquare className="w-6 h-6" />} title="Manage Tasks" desc="Stay on track" color="from-green-500 to-emerald-500" />
          <QuickLink href="/study" icon={<Brain className="w-6 h-6" />} title="Study Tools" desc="Focus and learn" color="from-purple-500 to-pink-500" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg, color)}>{icon}</div>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <Link href={href} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-700 transition-all">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </Link>
  );
}
