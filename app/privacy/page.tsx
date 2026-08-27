'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          <Section icon={<Eye />} title="Information We Collect">
            <p>We collect information you provide directly:</p>
            <ul>
              <li><strong>Account Information:</strong> Email address, name, and profile details when you sign up</li>
              <li><strong>Academic Data:</strong> Notes, tasks, schedules, flashcards, grades, and study sessions you create</li>
              <li><strong>Usage Data:</strong> How you interact with the app to improve our services</li>
            </ul>
          </Section>

          <Section icon={<Database />} title="How We Use Your Data">
            <p>Your data is used solely to provide and improve StudyNest:</p>
            <ul>
              <li>Store and sync your academic content across devices</li>
              <li>Provide AI-powered study tools (note summaries, flashcard generation)</li>
              <li>Analyze usage patterns to improve the app experience</li>
              <li>Send important account notifications (optional)</li>
            </ul>
          </Section>

          <Section icon={<Lock />} title="Data Security">
            <p>We take security seriously:</p>
            <ul>
              <li>All data is encrypted in transit (TLS 1.3) and at rest</li>
              <li>Row-Level Security ensures only you can access your data</li>
              <li>We never sell or share your personal data with third parties</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </Section>

          <Section icon={<Globe />} title="Data Sharing">
            <p>We do not sell your personal information. We may share data only:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers who assist in operating StudyNest (hosted infrastructure)</li>
            </ul>
          </Section>

          <Section icon={<Mail />} title="Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
              <li><strong>Delete:</strong> Request permanent deletion of your account and all data</li>
              <li><strong>Export:</strong> Download your notes, tasks, and other content</li>
              <li><strong>Opt-out:</strong> Disable analytics and non-essential data collection</li>
            </ul>
          </Section>

          <Section icon={<Shield />} title="Contact Us">
            <p>For privacy-related inquiries, contact us at:</p>
            <p className="mt-2">
              <a href="mailto:privacy@studynest.app" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                privacy@studynest.app
              </a>
            </p>
          </Section>
        </div>

        <div className="text-center mt-8 text-sm text-gray-400 dark:text-gray-500">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">StudyNest</Link> &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
          {icon}
        </div>
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
      </div>
      <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 pl-13">
        {children}
      </div>
    </div>
  );
}
