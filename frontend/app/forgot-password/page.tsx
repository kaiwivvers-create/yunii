'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || t('somethingWentWrong'));
        return;
      }
      // Demo mode (no RESEND_API_KEY): the backend returns the reset link so the
      // flow can still be completed locally.
      if (data.demoUrl) setDemoUrl(data.demoUrl);
      setSubmitted(true);
    } catch {
      setError(t('serverUnreachable'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="login" />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="w-full max-w-md animate-rise-in">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">
            {t('forgotPasswordTitle')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-dark-text-secondary mb-8">
            {t('forgotPasswordDesc')}
          </p>

          {submitted ? (
            <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6">
              <div className="flex items-start gap-2 mb-5 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('resetLinkSent', { email })}</span>
              </div>
              {demoUrl && (
                <div className="mb-5 px-4 py-3 bg-white/60 dark:bg-dark-bg-tertiary rounded-lg text-sm">
                  <p className="font-semibold text-slate-800 dark:text-dark-text mb-1">
                    {t('demoResetLink')}
                  </p>
                  <a
                    href={demoUrl}
                    className="text-[#9370DB] hover:underline break-all"
                  >
                    {demoUrl}
                  </a>
                </div>
              )}
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
              >
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2"
                >
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-md font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? t('sending') : t('sendResetLink')}
              </button>

              <p className="text-center">
                <Link href="/login" className="text-sm text-[#9370DB] hover:underline">
                  {t('backToLogin')}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
