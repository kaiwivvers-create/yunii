'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { guides, getGuide } from '../../../data/guides';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Clock, Check } from 'lucide-react';

export default function GuideArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { lang, t } = useLanguage();

  const guide = getGuide(slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Guide not found</h1>
          <Link href="/guides" className="text-[#9370DB] hover:underline">
            {t('backToGuides')}
          </Link>
        </div>
      </div>
    );
  }

  const related = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="guides" />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#9370DB] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToGuides')}
        </Link>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-8 h-72">
          <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6 text-white">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
              {lang === 'zh' ? guide.category : guide.category}
            </span>
            <h1 className="text-3xl font-bold mt-3">{lang === 'zh' ? guide.titleZh : guide.title}</h1>
            <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
              <Clock className="w-4 h-4" />
              {guide.readTime} {t('readTime')}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8">
          {guide.sections.map((section, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E0F0] p-6 sm:p-8 animate-rise-in" style={{ animationDelay: `${i * 0.06}s` }}>
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

        {/* Related */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            {t('relatedGuides')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white rounded-xl border border-[#E2E0F0] p-4 hover:border-[#9370DB]/60 hover:shadow-md transition-all"
              >
                <div className="h-24 rounded-lg overflow-hidden mb-3">
                  <img src={g.image} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#9370DB] transition-colors line-clamp-2">
                  {lang === 'zh' ? g.titleZh : g.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
