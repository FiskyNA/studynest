'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Clock, BarChart3, TrendingUp, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Session { id: string; type: string; duration_minutes: number; completed: boolean; created_at: string; }
interface AnalyticsData { day: string; minutes: number; sessions: number; }
interface WeeklyGoal { target: number; current: number; }

export default function StudyPage() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [weeklyData, setWeeklyData] = useState<AnalyticsData[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>({ target: 10, current: 0 });
  const supabase = createClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionRef = useRef<string | null>(null);

  useEffect(() => {
    loadSessions();
    loadWeeklyGoal();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  async function loadSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'focus')
      .eq('completed', true)
      .gte('created_at', today);

    if (todaySessions) {
      setSessionsToday(todaySessions.length);
      const totalMin = todaySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      setTotalFocusTime(totalMin);
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: weekSessions } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'focus')
      .eq('completed', true)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at');

    if (weekSessions) {
      setSessions(weekSessions);
      buildWeeklyChart(weekSessions);
    }
  }

  function buildWeeklyChart(sessionData: Session[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: AnalyticsData[] = days.map((day) => ({ day, minutes: 0, sessions: 0 }));
    sessionData.forEach((s) => {
      const d = new Date(s.created_at);
      data[d.getDay()].minutes += s.duration_minutes;
      data[d.getDay()].sessions += 1;
    });
    setWeeklyData(data);
  }

  async function loadWeeklyGoal() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'focus')
      .eq('completed', true)
      .gte('created_at', getWeekStart());
    setWeeklyGoal((prev) => ({ ...prev, current: (data?.length || 0) }));
  }

  function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }

  async function startSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('study_sessions').insert({ user_id: user.id, type: mode, duration_minutes: mode === 'focus' ? focusMinutes : breakMinutes, completed: false }).select().single();
    if (data) currentSessionRef.current = data.id;
    setIsRunning(true);
  }

  async function completeSession() {
    if (currentSessionRef.current) {
      await supabase.from('study_sessions').update({ completed: true }).eq('id', currentSessionRef.current);
      currentSessionRef.current = null;
    }
    if (mode === 'focus') {
      setSessionsToday((s) => s + 1);
      setTotalFocusTime((t) => t + focusMinutes);
      setWeeklyGoal((prev) => ({ ...prev, current: prev.current + 1 }));
      toast.success(`Focus session complete! +${focusMinutes}min`);
      if (sessionsToday + 1 >= 4 && (sessionsToday + 1) % 4 === 0) {
        toast('Time for a longer break!', { icon: '☕' });
      }
    }
    loadSessions();
  }

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        completeSession();
        setMode((m) => m === 'focus' ? 'break' : 'focus');
        return mode === 'focus' ? breakMinutes * 60 : focusMinutes * 60;
      }
      return prev - 1;
    });
  }, [mode, focusMinutes, breakMinutes]);

  useEffect(() => {
    if (isRunning) { intervalRef.current = setInterval(tick, 1000); }
    else if (intervalRef.current) { clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  function reset() { setIsRunning(false); setTimeLeft(mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60); }

  function formatTime(seconds: number) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; }

  const totalWeekMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="h-full overflow-y-auto p-6 dark:bg-gray-950">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Study</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Focus sessions and analytics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <button onClick={() => { setMode('focus'); setTimeLeft(focusMinutes * 60); setIsRunning(false); }} className={clsx('px-4 py-2 rounded-xl font-medium transition-colors', mode === 'focus' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>
                <Timer className="w-4 h-4 inline mr-1" />Focus
              </button>
              <button onClick={() => { setMode('break'); setTimeLeft(breakMinutes * 60); setIsRunning(false); }} className={clsx('px-4 py-2 rounded-xl font-medium transition-colors', mode === 'break' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>
                <Coffee className="w-4 h-4 inline mr-1" />Break
              </button>
            </div>
            <div className="text-7xl font-mono font-bold dark:text-white mb-8 tabular-nums">{formatTime(timeLeft)}</div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { if (!isRunning) startSession(); setIsRunning(!isRunning); }} className={clsx('flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-colors text-lg', isRunning ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-brand-600 text-white hover:bg-brand-700')}>
                {isRunning ? <><Pause className="w-5 h-5" />Pause</> : <><Play className="w-5 h-5" />Start</>}
              </button>
              <button onClick={reset} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"><RotateCcw className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <span>Focus: {focusMinutes}min</span>
              <span>Break: {breakMinutes}min</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Focus</label>
                <input type="number" min={5} max={90} value={focusMinutes} onChange={(e) => { const v = parseInt(e.target.value) || 25; setFocusMinutes(v); if (mode === 'focus' && !isRunning) setTimeLeft(v * 60); }} className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-center dark:text-white" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Break</label>
                <input type="number" min={1} max={30} value={breakMinutes} onChange={(e) => { const v = parseInt(e.target.value) || 5; setBreakMinutes(v); if (mode === 'break' && !isRunning) setTimeLeft(v * 60); }} className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-center dark:text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 dark:text-white">Weekly Study Activity</h3>
            {weeklyData.some((d) => d.minutes > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px', color: '#F3F4F6' }} />
                  <Bar dataKey="minutes" fill="#6366F1" radius={[6, 6, 0, 0]} name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-gray-500"><p>Complete focus sessions to see your weekly activity chart</p></div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 text-white">
            <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{totalFocusTime}<span className="text-lg font-normal opacity-75">min</span></p>
            <p className="text-sm opacity-75 mt-1">Total focus time today</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <Clock className="w-6 h-6 text-brand-500 mb-2" />
            <p className="text-2xl font-bold dark:text-white">{sessionsToday}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sessions today</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
            <p className="text-2xl font-bold dark:text-white">{weeklyGoal.current}/{weeklyGoal.target}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly goal</p>
            <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((weeklyGoal.current / weeklyGoal.target) * 100, 100)}%` }} />
            </div>
          </div>
          {sessions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-3 dark:text-white">Recent Sessions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sessions.slice(-5).reverse().map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">{new Date(s.created_at).toLocaleDateString()}</span>
                    <span className="font-medium dark:text-white">{s.duration_minutes}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
