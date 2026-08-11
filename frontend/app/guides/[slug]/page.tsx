'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import GuideEditor from '@/components/GuideEditor';
import { guides, getGuide } from '../../../data/guides';
import { localizeGuide } from '../../../data/guideTranslations';
import { getGuideBySlug, loadGuides } from '../../../utils/guidesStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { isAdminRole } from '@/utils/roles';
import { ArrowLeft, Clock, Check, Lock, Pencil } from 'lucide-react';

const categoryKeys: Record<string, string> = {
  Admissions: 'admissions',
  Costs: 'costs',
  Visas: 'visas',
  Scholarships: 'scholarshipsGuide',
  Deadlines: 'deadlinesGuide',
  'Country Guides': 'countryGuides',
};

export default function GuideArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { lang, t } = useLanguage();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkLogin = () => {
      const storedUser = localStorage.getItem('user');
      setIsLoggedIn(!!storedUser);
      if (storedUser) {
        try {
          setIsAdmin(isAdminRole(JSON.parse(storedUser).role));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('userLogin', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('userLogin', checkLogin);
    };
  }, []);

  // Loaded from storage once mounted (client-only); static during SSR / first paint.
  // Deriving from the current slug avoids a stale-article flash when navigating
  // between related guides, and picks up admin edits after save.
  const guide = mounted ? getGuideBySlug(slug) : getGuide(slug);
  const displayed = guide ? localizeGuide(guide, lang) : null;
  const related = mounted
    ? loadGuides().filter((g) => g.slug !== slug).slice(0, 4)
    : guides.filter((g) => g.slug !== slug).slice(0, 4);

  if (!mounted) {
    return (
      <div className="h-screen bg-[#E8E8F0] overflow-hidden flex flex-col pt-16">
        <Navbar currentPage="guides" />
      </div>
    );
  }

  if (!guide || !displayed) {
    return (
      <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('guideNotFound')}</h1>
          <Link href="/guides" className="text-[#9370DB] hover:underline">
            {t('backToGuides')}
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#E8E8F0] overflow-hidden flex flex-col pt-16">
        <Navbar currentPage="guides" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E0F0] p-10 max-w-md w-full text-center shadow-2xl animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#9370DB] rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t('signInToReadGuide')}
            </h2>
            <p className="text-sm font-semibold text-[#9370DB] mb-1">
              {displayed.title}
            </p>
            <p className="text-slate-600 mb-6">
              {t('createFreeAccountUnlock')}
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full px-4 py-3 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/signup"
                className="block w-full px-4 py-3 border border-[#E2E0F0] text-slate-900 rounded-lg font-medium hover:bg-[#F4F2FA] transition-colors"
              >
                {t('createAccount')}
              </Link>
            </div>
            <Link
              href="/guides"
              className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {t('maybeLater')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#E8E8F0] overflow-hidden flex flex-col pt-16">
      <Navbar currentPage="guides" />

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Related Guides — left sidebar on desktop, below the article on mobile */}
        <aside className="order-2 lg:order-1 w-full lg:w-72 shrink-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-r border-[#A8A8C8] bg-[#D8D8E8] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-4">
            {t('relatedGuides')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white rounded-xl border border-[#E2E0F0] p-3 hover:border-[#9370DB]/60 hover:shadow-md transition-all flex items-start gap-3"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={g.image}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-[#9370DB] transition-colors line-clamp-2">
                    {localizeGuide(g, lang).title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {g.readTime} {t('readTime')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Article */}
        <section className="order-1 lg:order-2 flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-10">
          {/* Wide article column — fills the pane on normal screens, capped only on ultra-wide monitors */}
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-[#9370DB] transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToGuides')}
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setEditorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] hover:bg-[#9370DB]/20 rounded-full text-xs font-semibold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('edit')}
                </button>
              )}
            </div>

            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-8 h-72">
              <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                  {t(categoryKeys[guide.category] || guide.category)}
                </span>
                <h1 className="text-3xl font-bold mt-3">{displayed.title}</h1>
                <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
                  <Clock className="w-4 h-4" />
                  {guide.readTime} {t('readTime')}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-8">
              {displayed.sections.map((section, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E2E0F0] p-6 sm:p-8 animate-rise-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-3">{section.heading}</h2>
                  {section.body && <p className="text-slate-700 leading-relaxed mb-4">{section.body}</p>}
                  {section.list && (
                    <ul className="space-y-2.5">
                      {section.list.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-slate-700">
                          <span className="mt-1 w-5 h-5 rounded-full bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <GuideEditor
        open={editorOpen}
        initialGuide={guide ?? null}
        onClose={() => setEditorOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
        onDeleted={() => router.push('/guides')}
      />
    </div>
  );
}
