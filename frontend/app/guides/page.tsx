'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { guides } from '../../data/guides';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

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

  const filtered = category === 'All' ? guides : guides.filter((g) => g.category === category);

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="guides" />

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            {guides.length} {t('guides')}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{t('guidesTitle')}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">{t('guidesSubtitle')}</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E2E0F0] hover:border-[#9370DB]/60 hover:shadow-xl hover:shadow-[#9370DB]/10 transition-all animate-rise-in"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded-full">
                  {lang === 'zh' ? categoryKeys[guide.category] ? t(categoryKeys[guide.category]) : guide.category : guide.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  {guide.readTime} {t('readTime')}
                </div>
                <h2 className="font-bold text-slate-900 mb-2 group-hover:text-[#9370DB] transition-colors">
                  {lang === 'zh' ? guide.titleZh : guide.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {lang === 'zh' ? guide.excerptZh : guide.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9370DB]">
                  {t('readMore')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
