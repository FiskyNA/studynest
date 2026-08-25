'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Sparkles, BarChart3, BookOpen, Clock, Flame } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'ai' | 'analytics'>('pomodoro');
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold mb-4">Study Tools</h1>
        <div className="flex gap-2">
          {([ { id: 'pomodoro' as const, label: 'Pomodoro Timer', icon: Timer }, { id: 'ai' as const, label: 'AI Assistant', icon: Sparkles }, { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 } ]).map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', activeTab === t.id ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100')}><t.icon className="w-4 h-4" />{t.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'pomodoro' && <PomodoroTimer />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'analytics' && <StudyAnalytics />}
      </div>
    </div>
  );
}

function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const modes = { work: { label: 'Focus', dur: 25 * 60 }, short: { label: 'Short Break', dur: 5 * 60 }, long: { label: 'Long Break', dur: 15 * 60 } };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((p) => { if (p <= 1) { clearInterval(intervalRef.current!); setIsRunning(false); if (mode === 'work') { setSessions((s) => s + 1); toast.success('Session done!'); } return 0; } return p - 1; });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, mode]);

  const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60;
  const progress = ((modes[mode].dur - timeLeft) / modes[mode].dur) * 100;

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="flex justify-center gap-2 mb-8">
        {(['work', 'short', 'long'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setTimeLeft(modes[m].dur); setIsRunning(false); }} className={clsx('px-4 py-2 rounded-lg text-sm font-medium', mode === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{modes[m].label}</button>
        ))}
      </div>
      <div className="w-64 h-64 mx-auto relative mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" className={clsx('transition-all duration-1000', mode === 'work' ? 'text-red-500' : mode === 'short' ? 'text-green-500' : 'text-blue-500')} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          <span className="text-sm text-gray-500 mt-2">{modes[mode].label}</span>
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className={clsx('w-16 h-16 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-red-500 to-orange-500 shadow-lg', isRunning && 'scale-95')}>
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        <button onClick={() => { setIsRunning(false); setTimeLeft(modes[mode].dur); }} className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200"><RotateCcw className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" /><p className="text-2xl font-bold">{sessions}</p><p className="text-xs text-gray-500">Sessions</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" /><p className="text-2xl font-bold">{sessions * 25}</p><p className="text-xs text-gray-500">Minutes</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><BookOpen className="w-5 h-5 text-green-500 mx-auto mb-1" /><p className="text-2xl font-bold">{Math.floor(sessions / 4)}</p><p className="text-xs text-gray-500">Long Breaks</p></div>
      </div>
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const suggestions = ['Summarize my notes', 'Create flashcards', 'Explain quantum mechanics', 'Plan my study schedule'];

  async function send(content: string) {
    if (!content.trim()) return;
    setMessages((p) => [...p, { role: 'user', content }]); setInput(''); setLoading(true);
    setTimeout(() => {
      const responses = ["I'd be happy to help! Start with the fundamentals, then practice, then review. Want me to go deeper?", "Great question! Focus on understanding over memorization. Use active recall and space your repetitions.", "Here are 3 steps: 1) Build the basics 2) Practice with examples 3) Teach it to someone else. Want flashcards for any of these?"];
      setMessages((p) => [...p, { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] }]); setLoading(false);
    }, 1500);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">AI Study Assistant</h2>
            <p className="text-gray-500 mb-6">Ask me anything about your studies.</p>
            <div className="flex flex-wrap justify-center gap-2">{suggestions.map((s) => (<button key={s} onClick={() => send(s)} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100">{s}</button>))}</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx('max-w-[80%] rounded-2xl px-4 py-3', msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md')}><p className="whitespace-pre-wrap text-sm">{msg.content}</p></div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} placeholder="Ask anything..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}

function StudyAnalytics() {
  const weekly = [{ day: 'Mon', h: 3.5 }, { day: 'Tue', h: 2.8 }, { day: 'Wed', h: 4.2 }, { day: 'Thu', h: 1.5 }, { day: 'Fri', h: 3.8 }, { day: 'Sat', h: 5 }, { day: 'Sun', h: 2 }];
  const subjects = [{ s: 'Math', h: 15, c: 'bg-blue-500' }, { s: 'Physics', h: 12, c: 'bg-purple-500' }, { s: 'Chemistry', h: 8, c: 'bg-green-500' }, { s: 'English', h: 6, c: 'bg-orange-500' }];
  const maxH = Math.max(...weekly.map((d) => d.h));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ l: 'Total Time', v: '47h', i: Clock }, { l: 'Sessions', v: '23', i: BookOpen }, { l: 'Avg Length', v: '45m', i: Timer }, { l: 'Streak', v: '5 days', i: Flame }].map((s) => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-xl p-4"><s.i className="w-5 h-5 text-gray-400 mb-2" /><p className="text-2xl font-bold">{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Weekly Hours</h3>
          <div className="flex items-end gap-2 h-40">{weekly.map((d) => (<div key={d.day} className="flex-1 flex flex-col items-center gap-1"><span className="text-xs text-gray-500">{d.h}h</span><div className="w-full bg-brand-500 rounded-t-md" style={{ height: `${(d.h / maxH) * 100}%` }} /><span className="text-xs text-gray-500">{d.day}</span></div>))}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold mb-4">By Subject</h3>
          <div className="space-y-3">{subjects.map((s) => (<div key={s.s}><div className="flex justify-between text-sm mb-1"><span>{s.s}</span><span className="text-gray-500">{s.h}h</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={clsx('h-full rounded-full', s.c)} style={{ width: `${(s.h / 15) * 100}%` }} /></div></div>))}</div>
        </div>
      </div>
    </div>
  );
}
