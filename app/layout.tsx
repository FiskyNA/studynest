import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'StudyNest — Your All-in-One Student Workspace',
  description: 'Notes, tasks, schedule, flashcards, grades, and AI study tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-gray-900 dark:text-white dark:border dark:border-gray-700' }} />
      </body>
    </html>
  );
}
