'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging (visible in the browser console)
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-dark-text-secondary mt-2">
          An unexpected error occurred while loading this page. Try again, or go back home.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-3">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors"
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- error boundaries should use plain anchors */}
          <a
            href="/"
            className="px-6 py-3 border border-slate-300 dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
