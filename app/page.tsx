'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, animate } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, CheckSquare, Calendar, Brain, BarChart3, Sparkles,
  ArrowRight, Zap, ChevronRight, Star, Users, Clock, Trophy,
  Menu, X, GraduationCap, Target, TrendingUp, Lightbulb
} from 'lucide-react';

function CursorDot() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 w-4 h-4 rounded-full bg-brand-400 pointer-events-none mix-blend-difference hidden lg:block"
      style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
    />
  );
}

function CursorRing() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 w-10 h-10 rounded-full border border-brand-400/40 pointer-events-none hidden lg:block"
      style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
    />
  );
}

function CursorTracker() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono text-xs text-white/30 hidden lg:block tabular-nums">
      {String(pos.x).padStart(4, '0')} X {String(pos.y).padStart(4, '0')} Y
    </div>
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setCount(Math.round(v)),
      });
      return controls.stop;
    }
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function TextReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WordReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const words = text.split(' ');
  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 1, 0.5, 1] }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

const features = [
  { num: '01', icon: BookOpen, title: 'Smart Notes', desc: 'Rich block editor with markdown, code blocks, task lists, tables, and image uploads. Organize with folders and tags.', gradient: 'from-blue-500 to-cyan-400' },
  { num: '02', icon: CheckSquare, title: 'Tasks & Kanban', desc: 'Manage assignments with priorities, due dates, recurring tasks, and drag-and-drop kanban boards.', gradient: 'from-green-500 to-emerald-400' },
  { num: '03', icon: Calendar, title: 'Schedule', desc: 'Visual class timetable with color-coded blocks. Click to edit, drag to reschedule, stay on top of your week.', gradient: 'from-orange-500 to-red-400' },
  { num: '04', icon: Brain, title: 'AI Flashcards', desc: 'Generate flashcards from your notes. SM-2 spaced repetition algorithm schedules optimal review times.', gradient: 'from-purple-500 to-pink-400' },
  { num: '05', icon: BarChart3, title: 'Grade Tracker', desc: 'Track grades across courses, calculate weighted averages, and visualize trends with beautiful charts.', gradient: 'from-yellow-500 to-orange-400' },
  { num: '06', icon: Sparkles, title: 'AI Assistant', desc: 'Get study help, summarize notes, generate flashcards, and plan your schedule with AI-powered tools.', gradient: 'from-indigo-500 to-violet-400' },
];

const steps = [
  { icon: Zap, title: 'Sign up in seconds', desc: 'Create your free account with email or Google. No credit card needed.' },
  { icon: Target, title: 'Organize your life', desc: 'Add your courses, schedule, notes, and tasks. Everything in one place.' },
  { icon: TrendingUp, title: 'Track your progress', desc: 'Watch your grades improve with analytics, flashcards, and smart study tools.' },
];

const testimonials = [
  { quote: 'StudyNest replaced 5 different apps I was using. Notes, tasks, schedule — everything in one beautiful place.', name: 'Sarah Chen', uni: 'Stanford University', year: 'Junior' },
  { quote: 'The AI flashcards are a game changer. I retention went up 40% after just two weeks of using the spaced repetition system.', name: 'Marcus Johnson', uni: 'MIT', year: 'Senior' },
  { quote: 'Finally a student app that looks good AND works well. The kanban board for tasks keeps me organized all semester.', name: 'Priya Patel', uni: 'UC Berkeley', year: 'Sophomore' },
];

export default function LandingPage() {
  const [navBlur, setNavBlur] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setNavBlur(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-hidden">
      <CursorDot />
      <CursorRing />
      <CursorTracker />

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${navBlur ? 'bg-[#050510]/80 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <span className="text-white font-bold text-sm font-display">SN</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">StudyNest</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="dotted-border px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg uppercase tracking-wider font-medium">Features</a>
            <a href="#how-it-works" className="dotted-border px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg uppercase tracking-wider font-medium">How It Works</a>
            <a href="#testimonials" className="dotted-border px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg uppercase tracking-wider font-medium">Reviews</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="dotted-border px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg">Log in</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all">
              Get Started Free
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white/60 hover:text-white">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/[0.06 px-6 py-6 space-y-4"
          >
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-white/60 hover:text-white py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block text-white/60 hover:text-white py-2">How It Works</a>
            <a href="#testimonials" onClick={() => setMobileMenu(false)} className="block text-white/60 hover:text-white py-2">Reviews</a>
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <Link href="/login" className="block text-center py-2.5 text-white/60 hover:text-white border border-white/10 rounded-xl">Log in</Link>
              <Link href="/signup" className="block text-center py-2.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-xl">Get Started Free</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] animate-float-slower" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-400/20 bg-brand-400/5 mb-8"
          >
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">Built for students, by students</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <span className="block text-gradient">Study Smarter.</span>
            <span className="block text-white/90 mt-2">Not Harder.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Notes, tasks, schedule, flashcards, grades, and AI-powered study tools — everything you need, in one beautiful workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-brand-500/25 transition-all duration-300"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white/70 rounded-2xl font-semibold text-lg hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Log In
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── STATS BAR ─── */}
      <section className="relative z-10 py-16 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 10000, suffix: '+', label: 'Students', icon: Users },
            { value: 500000, suffix: '+', label: 'Notes Created', icon: BookOpen },
            { value: 50000, suffix: '+', label: 'Study Hours', icon: Clock },
            { value: 49, suffix: '', label: 'App Rating', icon: Star, isDecimal: true },
          ].map((stat) => (
            <TextReveal key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                {stat.isDecimal ? (
                  <><AnimatedCounter target={stat.value} /><span className="text-brand-400">.9</span></>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-sm text-white/40">{stat.label}</p>
            </TextReveal>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <TextReveal className="text-center mb-20">
            <span className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-4 block">Features</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Everything you need to{' '}
              <span className="text-gradient">ace your studies</span>
            </h2>
          </TextReveal>

          <div className="space-y-8">
            {features.map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 1, 0.5, 1] }}
                className="group glass-card p-8 md:p-12 hover:bg-white/[0.05] transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-6xl md:text-8xl font-display font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors">{f.num}</span>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <f.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-gradient transition-all">{f.title}</h3>
                    <p className="text-white/40 text-lg leading-relaxed max-w-2xl">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative py-32 px-6 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <TextReveal className="text-center mb-20">
            <span className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-4 block">How It Works</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Get started in <span className="text-gradient">3 steps</span>
            </h2>
          </TextReveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

            {steps.map((step, i) => (
              <TextReveal key={i} delay={i * 0.15} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
                      <step.icon className="w-8 h-8 text-brand-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </TextReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <TextReveal className="text-center mb-20">
            <span className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-4 block">Testimonials</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Loved by <span className="text-gradient">students worldwide</span>
            </h2>
          </TextReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TextReveal key={i} delay={i * 0.1}>
                <div className="glass-card p-8 h-full hover:bg-white/[0.05] transition-all duration-500 group">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-white/60 leading-relaxed mb-8 text-lg">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t.name}</p>
                      <p className="text-white/30 text-xs">{t.uni} &middot; {t.year}</p>
                    </div>
                  </div>
                </div>
              </TextReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <TextReveal>
            <GraduationCap className="w-12 h-12 text-brand-400 mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Ready to transform your{' '}
              <span className="text-gradient">study habits?</span>
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students who are already using StudyNest to ace their courses. Free forever for basic features.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-brand-500/25 transition-all duration-300"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </TextReveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs font-display">SN</span>
                </div>
                <span className="font-display font-bold text-lg">StudyNest</span>
              </Link>
              <p className="text-white/30 text-sm leading-relaxed">
                The all-in-one student workspace. Notes, tasks, schedule, and more.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Features</a></li>
                <li><a href="#how-it-works" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">How It Works</a></li>
                <li><Link href="/signup" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Log In</Link></li>
                <li><a href="#" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Help Center</a></li>
                <li><a href="#" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Privacy Policy</Link></li>
                <li><a href="#" className="dotted-border text-sm text-white/30 hover:text-white transition-colors rounded px-1">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-sm">&copy; {new Date().getFullYear()} StudyNest. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="dotted-border text-white/20 hover:text-white transition-colors text-sm rounded px-1">Twitter</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="dotted-border text-white/20 hover:text-white transition-colors text-sm rounded px-1">GitHub</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="dotted-border text-white/20 hover:text-white transition-colors text-sm rounded px-1">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
