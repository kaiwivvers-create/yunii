'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Trash2, Calendar, MessageSquare } from 'lucide-react';

const parseMarkdown = (text: string) => {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>');
  html = html.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.17em; font-weight: bold; margin: 1em 0;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: bold; margin: 1em 0;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: bold; margin: 1em 0;">$1</h1>');
  html = html.replace(/^\s*[-*]{3,}\s*$/gm, '<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;" />');
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666;">$1</blockquote>');
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #9370DB; text-decoration: underline;">$1</a>');
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    if (line.match(/^\* /)) {
      if (!inList) {
        inList = true;
        return '<ul style="margin: 1em 0; padding-left: 2em;"><li>' + line.replace(/^\* /, '') + '</li>';
      }
      return '<li>' + line.replace(/^\* /, '') + '</li>';
    }
    if (inList) {
      inList = false;
      return '</ul>' + line;
    }
    return line;
  });
  if (inList) processedLines.push('</ul>');
  html = processedLines.join('\n');
  html = html.replace(/\n(?!<)/g, '<br>');
  html = html.replace(/(<\/h[1-6]>|<\/ul>|<hr style[^>]*\/>|<\/blockquote>)<br>/g, '$1');
  return html;
};

export default function RecommendationsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const sourceLabel = (source: string) => {
    const s = (source || 'chat').toLowerCase();
    if (s === 'survey') return t('sourceSurvey');
    if (s === 'explore') return t('sourceExplore');
    return t('sourceChat');
  };
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    let cancelled = false;
    try {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.email) {
        fetch(`/api/recommendations?email=${encodeURIComponent(u.email)}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((list) => {
            if (!cancelled) setRecommendations(Array.isArray(list) ? list : []);
          })
          .catch(() => {})
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDelete = async (id: number) => {
    const prev = recommendations;
    setRecommendations((prevList) => prevList.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      if (!res.ok) setRecommendations(prev);
    } catch {
      setRecommendations(prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="recommendations" />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text">
            {t('recommendationsTitle')}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-dark-text-secondary mb-8">
          {t('recommendationsSubtitle')}
        </p>

        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">
            {t('loading')}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-10 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-[#9370DB] dark:text-dark-violet mb-3" />
            <p className="text-slate-800 dark:text-dark-text-secondary mb-6">
              {t('noRecommendations')}
            </p>
            <Link
              href="/chat"
              className="inline-block px-5 py-2.5 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
            >
              {t('askAiNow')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg overflow-hidden"
              >
                {/* Question */}
                <div className="px-5 py-3 bg-[#9370DB]/10 dark:bg-dark-violet/15 border-b border-[#A8A8C8]/60 dark:border-dark-border">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-[#9370DB] dark:text-dark-violet shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-800 dark:text-dark-text">
                      {rec.query}
                    </p>
                  </div>
                </div>
                {/* AI answer */}
                <div className="px-5 py-4">
                  <div
                    className="prose prose-sm text-slate-800 dark:text-dark-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(rec.response || '') }}
                  />
                </div>
                {/* Meta */}
                <div className="px-5 py-2.5 bg-white/50 dark:bg-dark-bg-tertiary/40 border-t border-[#A8A8C8]/60 dark:border-dark-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-text-secondary">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {sourceLabel(rec.source)}
                    </span>
                    {rec.createdAt && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rec.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title={t('deleteRecommendation')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
