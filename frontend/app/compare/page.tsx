'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, Search, Scale, Trophy, ThumbsUp, ThumbsDown, Calendar, Wallet } from 'lucide-react';

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export default function ComparePage() {
  const { lang, t } = useLanguage();
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/admin/universities')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAllUniversities(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Load compare list from localStorage, fall back to ?ids= query
    let ids: number[] = [];
    try {
      const stored = localStorage.getItem('compareList');
      if (stored) ids = JSON.parse(stored);
    } catch {}
    if (ids.length === 0) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('ids');
      if (q) ids = q.split(',').map((s) => parseInt(s)).filter((n) => !isNaN(n));
    }
    setCompareList(ids);
  }, []);

  useEffect(() => {
    // Sync selected universities from ids whenever either changes
    setSelected(
      allUniversities.filter((u) => compareList.includes(u.id)).slice(0, 4)
    );
  }, [allUniversities, compareList]);

  const toggleUniversity = (uni: any) => {
    let next: number[];
    if (compareList.includes(uni.id)) {
      next = compareList.filter((id) => id !== uni.id);
    } else {
      if (compareList.length >= 4) return;
      next = [...compareList, uni.id];
    }
    setCompareList(next);
    localStorage.setItem('compareList', JSON.stringify(next));
  };

  const filtered = allUniversities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = [
    {
      key: 'worldRank',
      label: t('worldRank'),
      icon: Trophy,
      render: (u: any) => (u.rankings?.overall ? `#${u.rankings.overall}` : '—'),
    },
    {
      key: 'location',
      label: t('location'),
      render: (u: any) => u.location || '—',
    },
    {
      key: 'tuitionUG',
      label: t('tuitionUG'),
      icon: Wallet,
      render: (u: any) => u.details?.prices?.undergraduate || '—',
    },
    {
      key: 'tuitionG',
      label: t('tuitionG'),
      render: (u: any) => u.details?.prices?.graduate || '—',
    },
    {
      key: 'costOfLiving',
      label: t('costOfLiving'),
      icon: Wallet,
      render: (u: any) => (u.costOfLiving?.monthly ? `${u.costOfLiving.monthly} / ${t('monthlyCost')}` : '—'),
    },
    {
      key: 'topPrograms',
      label: t('topPrograms'),
      render: (u: any) => {
        const programs = u.rankings?.programs || {};
        const names = Object.keys(programs)
          .sort((a, b) => programs[a] - programs[b])
          .slice(0, 3);
        return names.length ? names.map((n) => `${n} (#${programs[n]})`).join(', ') : '—';
      },
    },
    {
      key: 'scholarships',
      label: t('scholarshipsAvailable'),
      render: (u: any) => (u.scholarships?.length ? `${u.scholarships.length}` : '—'),
    },
    {
      key: 'deadline',
      label: t('applicationsDeadline'),
      icon: Calendar,
      render: (u: any) => (u.applicationDeadlines?.[0]?.deadline ? u.applicationDeadlines[0].deadline : '—'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="compare" />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            {t('compare')}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('compareTitle')}</h1>
          <p className="text-slate-600">{t('compareSubtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Picker */}
          <div className="lg:w-80 w-full shrink-0 bg-white rounded-2xl border border-[#E2E0F0] p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">{t('pickUniversities')}</h2>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchUniversities')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F4F2FA] border border-[#E2E0F0] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-2 focus:ring-[#9370DB]/20"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
              {filtered.map((uni) => {
                const active = compareList.includes(uni.id);
                return (
                  <button
                    key={uni.id}
                    onClick={() => toggleUniversity(uni)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                      active
                        ? 'bg-[#9370DB]/10 border-[#9370DB]/50'
                        : 'border-transparent hover:bg-[#F4F2FA]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#9370DB] border-[#9370DB] text-white' : 'border-slate-300'
                      }`}
                    >
                      {active && <Plus className="w-3.5 h-3.5 rotate-45" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-900 truncate">{uni.name}</span>
                      <span className="block text-xs text-slate-500 truncate">{uni.location}</span>
                    </span>
                    {uni.rankings?.overall && (
                      <span className="text-xs font-semibold text-[#9370DB] shrink-0">#{uni.rankings.overall}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#F0EEF8] text-xs text-slate-500">
              {selected.length}/4
            </div>
          </div>

          {/* Comparison table */}
          <div className="flex-1 min-w-0">
            {selected.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#A8A8C8] p-16 text-center">
                <Scale className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{t('emptyCompare')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E0F0] overflow-hidden shadow-sm">
                {/* Header row — university cards */}
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(0, 1fr))` }}>
                  <div className="p-4" />
                  {selected.map((u) => (
                    <div key={u.id} className="p-4 border-l border-[#F0EEF8] relative">
                      <button
                        onClick={() => toggleUniversity(u)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title={t('remove')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="h-24 rounded-lg overflow-hidden mb-3">
                        <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                      </div>
                      <Link
                        href={`/university/${slugify(u.name)}`}
                        className="font-bold text-slate-900 hover:text-[#9370DB] transition-colors block"
                      >
                        {u.name}
                      </Link>
                      <p className="text-sm text-slate-500 mt-0.5">{u.location}</p>
                      {u.rankings?.overall && (
                        <span className="inline-flex mt-2 px-2 py-0.5 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-xs font-semibold">
                          {t('worldRank')} #{u.rankings.overall}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Attribute rows */}
                {rows.map((row, i) => (
                  <div
                    key={row.key}
                    className="grid"
                    style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(0, 1fr))` }}
                  >
                    <div className={`p-3 px-4 flex items-center gap-2 text-sm font-medium text-slate-600 ${i % 2 ? 'bg-[#FAF8FF]' : ''}`}>
                      {row.icon && <row.icon className="w-4 h-4 text-[#9370DB]" />}
                      {row.label}
                    </div>
                    {selected.map((u) => (
                      <div key={u.id} className={`p-3 px-4 text-sm text-slate-800 border-l border-[#F0EEF8] ${i % 2 ? 'bg-[#FAF8FF]' : ''}`}>
                        {row.render(u)}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Pros row */}
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(0, 1fr))` }}>
                  <div className="p-4 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50/50">
                    <ThumbsUp className="w-4 h-4" />
                    {t('pros')}
                  </div>
                  {selected.map((u) => (
                    <div key={u.id} className="p-4 border-l border-[#F0EEF8] bg-emerald-50/50 space-y-2">
                      {(u.pros || []).map((p: string, j: number) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-slate-800">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">+</span>
                          {p}
                        </div>
                      ))}
                      {(!u.pros || u.pros.length === 0) && <p className="text-sm text-slate-400">—</p>}
                    </div>
                  ))}
                </div>

                {/* Cons row */}
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(0, 1fr))` }}>
                  <div className="p-4 flex items-center gap-2 text-sm font-medium text-red-500 bg-red-50/50">
                    <ThumbsDown className="w-4 h-4" />
                    {t('cons')}
                  </div>
                  {selected.map((u) => (
                    <div key={u.id} className="p-4 border-l border-[#F0EEF8] bg-red-50/50 space-y-2">
                      {(u.cons || []).map((c: string, j: number) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-slate-800">
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">−</span>
                          {c}
                        </div>
                      ))}
                      {(!u.cons || u.cons.length === 0) && <p className="text-sm text-slate-400">—</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
