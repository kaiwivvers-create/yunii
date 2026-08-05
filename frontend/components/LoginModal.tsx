'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal shown when a logged-out user tries to use a gated feature
 * (chatting, exploring university details, etc.). Prompts them to sign in.
 */
export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-8 max-w-md w-full text-center animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-4 bg-[#9370DB] dark:bg-dark-violet rounded-full flex items-center justify-center">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-2">
          Sign in to continue
        </h2>
        <p className="text-slate-800 dark:text-dark-text-secondary mb-6">
          You need an account to use this feature. It only takes a minute to create one.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full px-4 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="block w-full px-4 py-3 border border-[#A8A8C8] dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg font-medium hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            Create an Account
          </Link>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
