'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, CheckSquare, Calendar, Brain, GraduationCap, Timer, Settings, LogOut, ChevronLeft, Search, Plus, Sparkles, Moon, Sun, Command } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/components/theme-provider';
import { CommandPalette } from '@/components/command-palette';
import { QuickCapture } from '@/components/quick-capture';

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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const supabase = createClient();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); setQuickOpen(true); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={clsx('flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          {!collapsed && (
            <Link href="/notes" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">SN</span></div>
              <span className="font-bold text-lg dark:text-white">StudyNest</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft className={clsx('w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
        {!collapsed && (
          <div className="px-3 py-3">
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Search className="w-4 h-4" /><span>Search...</span>
              <kbd className="ml-auto text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">⌘K</kbd>
            </button>
          </div>
        )}
        <div className={clsx('px-3 pb-2', collapsed && 'px-2')}>
          <button onClick={() => setQuickOpen(true)} className={clsx('flex items-center gap-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700', collapsed ? 'p-2 justify-center w-full' : 'px-4 py-2 w-full')}>
            <Plus className="w-4 h-4" />{!collapsed && 'New Note'}
          </button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white', collapsed && 'justify-center px-2')} title={collapsed ? item.label : undefined}>
                <item.icon className="w-5 h-5 flex-shrink-0" />{!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className={clsx('px-3 py-2', collapsed && 'px-2')}>
          <button className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50', collapsed && 'justify-center px-2')} title={collapsed ? 'AI Assistant' : undefined}>
            <Sparkles className="w-5 h-5 flex-shrink-0" />{!collapsed && 'AI Assistant'}
          </button>
        </div>
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button onClick={toggle} className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800', collapsed && 'justify-center px-2')} title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}{!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </button>
          <Link href="/settings" className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800', collapsed && 'justify-center px-2')} title={collapsed ? 'Settings' : undefined}>
            <Settings className="w-5 h-5" />{!collapsed && 'Settings'}
          </Link>
          <button onClick={handleLogout} className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 w-full', collapsed && 'justify-center px-2')} title={collapsed ? 'Log out' : undefined}>
            <LogOut className="w-5 h-5" />{!collapsed && 'Log out'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      {quickOpen && <QuickCapture onClose={() => setQuickOpen(false)} />}
    </div>
  );
}
