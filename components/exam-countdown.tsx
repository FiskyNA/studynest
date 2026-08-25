'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CalendarClock, Plus, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Exam { id: string; name: string; date: string; subject: string; }

export function ExamCountdown() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');
  const supabase = createClient();

  useEffect(() => { loadExams(); }, []);

  async function loadExams() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('tasks').select('id, title, due_date, subject').eq('user_id', user.id).not('due_date', 'is', null).gte('due_date', new Date().toISOString()).order('due_date');
    if (data) setExams(data.map((t) => ({ id: t.id, name: t.title, date: t.due_date, subject: t.subject || '' })).slice(0, 5));
  }

  function getDaysLeft(dateStr: string) {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold">Upcoming Deadlines</h3>
        </div>
      </div>
      {exams.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No upcoming deadlines. Add tasks with due dates!</p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const days = getDaysLeft(exam.date);
            return (
              <div key={exam.id} className="flex items-center gap-3">
                <div className={clsx('w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0', days <= 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : days <= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400')}>
                  <span className="text-lg font-bold leading-none">{days}</span>
                  <span className="text-[10px] leading-none">days</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{exam.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{exam.subject || new Date(exam.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
