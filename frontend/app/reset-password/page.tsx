'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(t('invalidToken'));
      return;
    }
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || t('resetTokenInvalid'));
        return;
      }
      setDone(true);
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
          <div className="w-14 h-14 rounded-full bg-[#9370DB] dark:bg-dark-violet flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">
            {t('resetPasswordTitle')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-dark-text-secondary mb-8">
            {t('resetPasswordDesc')}
          </p>

          {done ? (
            <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6">
              <div className="flex items-start gap-2 mb-5 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('resetSuccess')}</span>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-md font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
              >
                {t('signIn')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2"
                >
                  {t('newPassword')}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2"
                >
                  {t('confirmNewPassword')}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
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
                {isLoading ? t('sending') : t('resetPasswordBtn')}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
