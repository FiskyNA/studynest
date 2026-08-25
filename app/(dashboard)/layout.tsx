'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, CheckSquare, Calendar, Brain, GraduationCap, Timer, Settings, LogOut, ChevronLeft, Search, Plus, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/flashcards', label: 'Flashcards', icon: Brain },
  { href: '/grades', label: 'Grades', icon: GraduationCap },
  { href: '/study', label: 'Study Tools', icon: Timer },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={clsx('flex flex-col bg-white border-r border-gray-200 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/notes" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">SN</span></div>
              <span className="font-bold text-lg">StudyNest</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className={clsx('w-4 h-4 text-gray-500 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
        {!collapsed && (
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">
              <Search className="w-4 h-4" /><span>Search...</span>
              <kbd className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">⌘K</kbd>
            </div>
          </div>
        )}
        <div className={clsx('px-3 pb-2', collapsed && 'px-2')}>
          <button className={clsx('flex items-center gap-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700', collapsed ? 'p-2 justify-center w-full' : 'px-4 py-2 w-full')}>
            <Plus className="w-4 h-4" />{!collapsed && 'New Note'}
          </button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', collapsed && 'justify-center px-2')} title={collapsed ? item.label : undefined}>
                <item.icon className="w-5 h-5 flex-shrink-0" />{!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className={clsx('px-3 py-2', collapsed && 'px-2')}>
          <button className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100', collapsed && 'justify-center px-2')} title={collapsed ? 'AI Assistant' : undefined}>
            <Sparkles className="w-5 h-5 flex-shrink-0" />{!collapsed && 'AI Assistant'}
          </button>
        </div>
        <div className="px-3 py-3 border-t border-gray-100 space-y-1">
          <Link href="/settings" className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50', collapsed && 'justify-center px-2')} title={collapsed ? 'Settings' : undefined}>
            <Settings className="w-5 h-5" />{!collapsed && 'Settings'}
          </Link>
          <button onClick={handleLogout} className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full', collapsed && 'justify-center px-2')} title={collapsed ? 'Log out' : undefined}>
            <LogOut className="w-5 h-5" />{!collapsed && 'Log out'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
