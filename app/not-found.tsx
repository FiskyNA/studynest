'use client';

import Link from 'next/link';
import { FileX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
            <FileX className="w-16 h-16 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg animate-bounce">
            4
          </div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
            4
          </div>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-4">404</h1>
        <h2 className="text-2xl font-bold dark:text-white mb-3">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25">
            <Home className="w-4 h-4" />Go Home
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />Go Back
          </button>
        </div>
        <div className="mt-12 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
