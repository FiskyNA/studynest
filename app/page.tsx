import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SN</span>
          </div>
          <span className="font-bold text-xl">StudyNest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700">
            Get Started — Free
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            Built for students, by students
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your entire student life, <span className="text-brand-600">organized.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Notes, tasks, schedule, flashcards, grades, and AI-powered study tools — everything you need to crush it in school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-brand-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/25">
              Start for Free
            </Link>
          </div>
        </div>
        <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📝', title: 'Smart Notes', desc: 'Block-based editor with markdown, code blocks, and more.' },
            { icon: '✅', title: 'Tasks & Todos', desc: 'Manage assignments with priorities and deadlines.' },
            { icon: '📅', title: 'Schedule', desc: 'Class timetable and assignment due dates.' },
            { icon: '🧠', title: 'AI Assistant', desc: 'Summarize notes, generate flashcards, explain concepts.' },
            { icon: '🃏', title: 'Flashcards', desc: 'Spaced repetition for effective memorization.' },
            { icon: '📊', title: 'Grade Tracker', desc: 'Track grades and calculate GPA.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-brand-200 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        StudyNest &copy; 2026
      </footer>
    </div>
  );
}
