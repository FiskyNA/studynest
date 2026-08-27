'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, CheckSquare, Calendar, Brain, BarChart3, Shield, Zap, Star } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Smart Notes', desc: 'Block-based editor with markdown, code blocks, task lists, and more.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: CheckSquare, title: 'Tasks & Kanban', desc: 'Manage assignments with priorities, due dates, and drag-and-drop boards.', gradient: 'from-green-500 to-emerald-500' },
  { icon: Calendar, title: 'Schedule', desc: 'Visual class timetable with color-coded blocks and editing.', gradient: 'from-orange-500 to-red-500' },
  { icon: Brain, title: 'AI Flashcards', desc: 'Generate flashcards from notes with AI-powered spaced repetition.', gradient: 'from-purple-500 to-pink-500' },
  { icon: BarChart3, title: 'Grade Tracker', desc: 'Track grades, calculate GPA, and visualize trends over time.', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Get study help, summarize notes, and plan your schedule with AI.', gradient: 'from-indigo-500 to-purple-500' },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500K+', label: 'Notes Created' },
  { value: '4.9', label: 'Rating', icon: Star },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SN</span>
          </div>
          <span className="font-bold text-xl dark:text-white">StudyNest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/25">
            Get Started — Free
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-32 relative">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-400/20 dark:bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-brand-100 dark:border-brand-800"
          >
            <Zap className="w-4 h-4" />
            Built for students, by students
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="dark:text-white">Your entire student life,</span>
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              organized.
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Notes, tasks, schedule, flashcards, grades, and AI-powered study tools — everything you need to crush it in school.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup" className="group bg-gradient-to-r from-brand-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-brand-600/25 transition-all flex items-center justify-center gap-2">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              Log In
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">{s.value}</span>
                {s.icon && <s.icon className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-6">
          <span>StudyNest &copy; {new Date().getFullYear()}</span>
          <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
