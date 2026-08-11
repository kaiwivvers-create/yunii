'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import LoginModal from '@/components/LoginModal';
import GuideEditor from '@/components/GuideEditor';
import { guides } from '../../data/guides';
import type { Guide } from '../../data/guides';
import { localizeGuide } from '../../data/guideTranslations';
import { loadGuides } from '../../utils/guidesStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { isAdminRole } from '@/utils/roles';
import { BookOpen, Clock, ArrowRight, Plus, Pencil } from 'lucide-react';

const categoryKeys: Record<string, string> = {
  Admissions: 'admissions',
  Costs: 'costs',
  Visas: 'visas',
  Scholarships: 'scholarshipsGuide',
  Deadlines: 'deadlinesGuide',
  'Country Guides': 'countryGuides',
};

export default function GuidesPage() {
  const { lang, t } = useLanguage();
  const [category, setCategory] = useState<string>('All');
  const [guidesList, setGuidesList] = useState<Guide[]>(guides);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);

  useEffect(() => {
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

  // Load guides (static + any admin customizations) once mounted
  useEffect(() => {
    setGuidesList(loadGuides());
  }, []);

  const filtered = category === 'All' ? guidesList : guidesList.filter((g) => g.category === category);

  return (
    <div className="h-screen bg-[#E8E8F0] overflow-hidden flex flex-col pt-16">
      <Navbar currentPage="guides" />

      <section className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="relative text-center mb-6 shrink-0">
          {isAdmin && (
            <button
              onClick={() => {
                setEditingGuide(null);
                setEditorOpen(true);
              }}
              className="absolute right-0 top-0 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9370DB] text-white hover:bg-[#7B68EE] rounded-full text-xs font-semibold shadow-md shadow-[#9370DB]/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('newGuide')}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingGuide(null);
                setEditorOpen(true);
              }}
              className="sm:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#9370DB] text-white shadow-lg shadow-[#9370DB]/30 flex items-center justify-center hover:bg-[#7B68EE] transition-colors"
              title={t('newGuide')}
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            {guidesList.length} {t('guides')}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{t('guidesTitle')}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">{t('guidesSubtitle')}</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 shrink-0">
          {['All', 'Admissions', 'Costs', 'Visas', 'Scholarships', 'Deadlines', 'Country Guides'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === c
                  ? 'bg-[#9370DB] text-white shadow-md shadow-[#9370DB]/30'
                  : 'bg-white text-slate-600 hover:bg-[#9370DB]/10 hover:text-[#9370DB] border border-[#E2E0F0]'
              }`}
            >
              {c === 'All' ? t('all') : t(categoryKeys[c] || c)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    setShowLogin(true);
                  }
                }}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E2E0F0] hover:border-[#9370DB]/60 hover:shadow-xl hover:shadow-[#9370DB]/10 transition-all animate-rise-in"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded-full">
                    {t(categoryKeys[guide.category] || guide.category)}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingGuide(guide);
                        setEditorOpen(true);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/85 backdrop-blur text-slate-700 hover:text-[#9370DB] hover:bg-white rounded-full shadow transition-colors"
                      title="Edit guide"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.readTime} {t('readTime')}
                  </div>
                  <h2 className="font-bold text-slate-900 mb-2 group-hover:text-[#9370DB] transition-colors">
                    {localizeGuide(guide, lang).title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {localizeGuide(guide, lang).excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9370DB]">
                    {t('readMore')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GuideEditor
        open={editorOpen}
        initialGuide={editingGuide}
        onClose={() => setEditorOpen(false)}
        onSaved={() => setGuidesList(loadGuides())}
        onDeleted={() => setGuidesList(loadGuides())}
      />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
