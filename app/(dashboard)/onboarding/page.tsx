'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Calendar, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { title: 'Welcome to StudyNest', subtitle: "Let's set up your workspace", icon: GraduationCap },
  { title: 'Your University', subtitle: 'Where do you study?', icon: GraduationCap },
  { title: 'Your Major', subtitle: 'What do you study?', icon: BookOpen },
  { title: 'Your Year', subtitle: 'How far along are you?', icon: Calendar },
];

const years = [
  { value: 1, label: 'Freshman', desc: '1st Year' },
  { value: 2, label: 'Sophomore', desc: '2nd Year' },
  { value: 3, label: 'Junior', desc: '3rd Year' },
  { value: 4, label: 'Senior', desc: '4th Year' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('full_name, university, major, year_of_study').eq('id', user.id).single();
      if (data) {
        if (data.full_name) setName(data.full_name);
        if (data.university) setUniversity(data.university);
        if (data.major) setMajor(data.major);
        if (data.year_of_study) setYear(data.year_of_study);
      }
    }
    loadProfile();
  }, []);

  async function handleComplete() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from('profiles').update({
      full_name: name || null,
      university: university || null,
      major: major || null,
      year_of_study: year,
    }).eq('id', user.id);

    if (error) toast.error('Failed to save');
    else { toast.success('Welcome to StudyNest!'); router.push('/dashboard'); }
    setSaving(false);
  }

  function canProceed() {
    if (step === 0) return true;
    if (step === 1) return university.trim().length > 0;
    if (step === 2) return major.trim().length > 0;
    if (step === 3) return year !== null;
    return false;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto bg-brand-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/25">
            <span className="text-white font-bold">SN</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-brand-600 w-8' : 'bg-gray-200 dark:bg-gray-700 w-4'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">Welcome to StudyNest!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Let&apos;s personalize your experience. This takes less than a minute.</p>
                  <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-center text-lg" />
                </div>
              )}

              {step === 1 && (
                <div className="py-4">
                  <div className="w-14 h-14 mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">{steps[step].title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{steps[step].subtitle}</p>
                  <input autoFocus type="text" value={university} onChange={(e) => setUniversity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && canProceed() && setStep(2)} placeholder="e.g. MIT, Stanford, UCLA" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-lg" />
                </div>
              )}

              {step === 2 && (
                <div className="py-4">
                  <div className="w-14 h-14 mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">{steps[step].title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{steps[step].subtitle}</p>
                  <input autoFocus type="text" value={major} onChange={(e) => setMajor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && canProceed() && setStep(3)} placeholder="e.g. Computer Science, Biology" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-lg" />
                </div>
              )}

              {step === 3 && (
                <div className="py-4">
                  <div className="w-14 h-14 mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white mb-2">{steps[step].title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{steps[step].subtitle}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {years.map((y) => (
                      <button key={y.value} onClick={() => setYear(y.value)} className={`p-4 rounded-xl border-2 text-left transition-all ${year === y.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        <p className="font-semibold dark:text-white">{y.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{y.desc}</p>
                        {year === y.value && <Check className="w-5 h-5 text-brand-600 mt-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={saving || !canProceed()} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Get Started'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          <button onClick={() => router.push('/dashboard')} className="hover:text-gray-600 dark:hover:text-gray-300">Skip for now</button>
        </p>
      </div>
    </div>
  );
}
