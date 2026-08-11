'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import LoginModal from '@/components/LoginModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadUserData, saveUserData } from '@/utils/userStorage';
import { Bookmark, ChevronLeft, ChevronDown, ChevronRight, Trophy, Search, Globe, Check, SlidersHorizontal, X } from 'lucide-react';

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const rankBands: { labelKey: string; value: string; max?: number }[] = [
  { labelKey: 'all', value: 'all' },
  { labelKey: 'top10', value: 'top10', max: 10 },
  { labelKey: 'top25', value: 'top25', max: 25 },
  { labelKey: 'top50', value: 'top50', max: 50 },
  { labelKey: 'top100', value: 'top100', max: 100 },
];

const ALL_REGION = 'All';

// Budget ranges match the survey/settings options (annual, approx. USD)
const budgetRanges: Record<string, [number, number | null]> = {
  '0-10000': [0, 10000],
  '10000-20000': [10000, 20000],
  '20000-30000': [20000, 30000],
  '30000-40000': [30000, 40000],
  '40000-50000': [40000, 50000],
  '50000+': [50000, null],
};

const budgetLabelKeys: Record<string, string> = {
  '0-10000': 'budgetUnder10k',
  '10000-20000': 'budget10to20k',
  '20000-30000': 'budget20to30k',
  '30000-40000': 'budget30to40k',
  '40000-50000': 'budget40to50k',
  '50000+': 'budgetOver50k',
};

// Approximate FX rates so tuition in the seeded (demo) data can be compared
// against USD budget ranges. Real deployments should store USD directly.
const CURRENCY_TO_USD: Record<string, number> = {
  USD: 1,
  US: 1,
  $: 1,
  GBP: 1.3,
  '£': 1.3,
  EUR: 1.08,
  '€': 1.08,
  CHF: 1.1,
  CNY: 0.14,
  '¥': 0.14,
  JPY: 0.0067,
  SGD: 0.75,
  AUD: 0.66,
  ZAR: 0.055,
};

/**
 * Pulls currency + amount out of a tuition string like "$57,261 per year"
 * and returns an approximate USD figure (null when unparseable).
 */
const parseTuition = (uni: any): number | null => {
  const raw = uni?.details?.prices?.undergraduate || uni?.details?.prices?.graduate || '';
  if (!raw) return null;
  if (/free/i.test(raw)) return 0;
  const match = raw.match(/([A-Z£€$¥]{1,3})?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  const amount = parseFloat(match[2].replace(/,/g, ''));
  const symbol = (match[1] || '').toUpperCase();
  const rate = CURRENCY_TO_USD[symbol] || 1;
  return Math.round(amount * rate);
};

const withinBudget = (uni: any, rangeKey: string | undefined): boolean => {
  if (!rangeKey || !budgetRanges[rangeKey]) return true;
  const tuition = parseTuition(uni);
  if (tuition === null) return true; // price unknown — don't silently drop the university
  const [lo, hi] = budgetRanges[rangeKey];
  if (tuition < lo) return false;
  if (hi !== null && tuition > hi) return false;
  return true;
};

const majorsFromPreference = (prefs: any): string[] => {
  if (!prefs?.intendedMajor) return [];
  return Array.isArray(prefs.intendedMajor) ? prefs.intendedMajor : [prefs.intendedMajor];
};

export default function Explore() {
  const { t } = useLanguage();
  const [regionData, setRegionData] = useState<Record<string, any[]>>({});
  const [regionOrder, setRegionOrder] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>(ALL_REGION);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [filterByPreferences, setFilterByPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankBand, setRankBand] = useState('all');
  const [savedUniversities, setSavedUniversities] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  // Normalized catalog tables (programs / scholarships) from the database
  const [programsByUni, setProgramsByUni] = useState<Map<number, string[]>>(new Map());
  const [scholarshipsByUni, setScholarshipsByUni] = useState<Map<number, any[]>>(new Map());
  const [majorOptions, setMajorOptions] = useState<string[]>([]);
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('all');

  // Search + world-rank matching only (province/preferences are applied later)
  const matchesBaseFilters = (uni: any) => {
    if (rankBand !== 'all') {
      const band = rankBands.find((b) => b.value === rankBand);
      if (band?.max && (uni.rankings?.overall || 999) > band.max) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const courses = Array.isArray(uni.details?.courses) ? uni.details.courses : [];
      const haystack = [
        uni.name,
        uni.location,
        uni.description,
        ...courses.map((c: any) => c?.name || c || ''),
        ...courses.map((c: any) => c?.details || ''),
        ...(programsByUni.get(uni.id) || []),
        ...(Array.isArray(uni.undergraduate) ? uni.undergraduate : []),
        ...(Array.isArray(uni.graduate) ? uni.graduate : []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    // Major filter (from the programs table)
    if (selectedMajor !== 'All') {
      const uniPrograms = programsByUni.get(uni.id) || [];
      if (!uniPrograms.some((p) => p.toLowerCase().includes(selectedMajor.toLowerCase()))) return false;
    }
    // Budget filter (parsed from tuition)
    if (!withinBudget(uni, selectedBudget)) return false;
    return true;
  };

  const allUniversities = () => Object.values(regionData).flat();

  const getFilteredUniversities = () => {
    const pool = selectedRegion === ALL_REGION ? allUniversities() : regionData[selectedRegion] || [];
    let universities = pool.filter(matchesBaseFilters);

    if (selectedProvince !== 'All') {
      universities = universities.filter((uni) => uni.province === selectedProvince);
    }

    // Preference filter: regions + budget + major from the saved profile
    if (filterByPreferences && userPreferences) {
      universities = universities.filter((uni) => {
        if (
          userPreferences.preferredRegions?.length > 0 &&
          !userPreferences.preferredRegions.includes(uni.region)
        ) {
          return false;
        }
        if (!withinBudget(uni, userPreferences.budget)) return false;
        const majors = majorsFromPreference(userPreferences);
        if (majors.length > 0) {
          const uniPrograms = programsByUni.get(uni.id) || [];
          if (!majors.some((m) => uniPrograms.some((p) => p.toLowerCase().includes(m.toLowerCase())))) {
            return false;
          }
        }
        return true;
      });
    }

    return universities;
  };

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('user'));
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('userLogin', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('userLogin', checkLogin);
    };
  }, []);

  useEffect(() => {
    // Pre-fill search from the home page: /explore?q=...
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);

    const storedPreferences = loadUserData('userPreferences', null);
    if (storedPreferences) {
      setUserPreferences(storedPreferences);
    }
    const saved = loadUserData<any[]>('savedUniversities', []);
    if (saved.length) {
      setSavedUniversities(saved);
    }
  }, []);

  // Load live university data + normalized catalog from the backend
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/universities').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/regions').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/programs').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/scholarships').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([unis, regions, programs, scholarships]: [any[], string[], any[], any[]]) => {
        const pByUni = new Map<number, string[]>();
        programs.forEach((p: any) => {
          if (!pByUni.has(p.universityId)) pByUni.set(p.universityId, []);
          pByUni.get(p.universityId)!.push(p.name);
        });
        const sByUni = new Map<number, any[]>();
        scholarships.forEach((s: any) => {
          if (!sByUni.has(s.universityId)) sByUni.set(s.universityId, []);
          sByUni.get(s.universityId)!.push(s);
        });
        setProgramsByUni(pByUni);
        setScholarshipsByUni(sByUni);
        setMajorOptions(Array.from(new Set(programs.map((p) => p.name).filter(Boolean))).sort());

        const order = regions.length ? regions : ['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'];
        const grouped: Record<string, any[]> = {};
        order.forEach((r) => {
          grouped[r] = [];
        });
        unis.forEach((u) => {
          if (!grouped[u.region]) grouped[u.region] = [];
          grouped[u.region].push(u);
        });
        setRegionOrder(order.filter((r) => (grouped[r] || []).length > 0));
        setRegionData(grouped);
        setSelectedRegion(ALL_REGION);
        setExpandedRegion(null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const universities = getFilteredUniversities();
      if (universities.length > 0) {
        setCurrentBgIndex((prev) => (prev + 1) % universities.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [
    selectedRegion,
    selectedProvince,
    rankBand,
    searchQuery,
    filterByPreferences,
    selectedMajor,
    selectedBudget,
    programsByUni,
  ]);

  const handleUniClick = (uni: any) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setSelectedUni(uni);
    saveUserData('selectedUniversity', uni);
  };

  const toggleSaveUniversity = (uni: any) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    const isSaved = savedUniversities.some((u) => u.id === uni.id);
    const action = isSaved ? 'unsave' : 'save';
    if (isSaved) {
      const updated = savedUniversities.filter((u) => u.id !== uni.id);
      setSavedUniversities(updated);
      saveUserData('savedUniversities', updated);
    } else {
      const updated = [...savedUniversities, uni];
      setSavedUniversities(updated);
      saveUserData('savedUniversities', updated);
    }
    try {
      const storedUser = localStorage.getItem('user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : undefined;
      fetch('/api/admin/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: uni.id,
          universityName: uni.name,
          region: uni.region || selectedRegion,
          action,
          userEmail,
        }),
      }).catch(() => {});
    } catch {}
  };

  const isUniversitySaved = (uniId: number) => {
    return savedUniversities.some((u) => u.id === uniId);
  };

  const handleRegionChange = (region: string) => {
    setIsAnimating(true);
    setSelectedRegion(region);
    setSelectedProvince('All');
    setExpandedRegion(region === ALL_REGION ? null : region);
    setCurrentBgIndex(0);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleRegion = (region: string) => {
    if (selectedRegion !== region) {
      setSelectedRegion(region);
      setSelectedProvince('All');
      setCurrentBgIndex(0);
      setExpandedRegion(region);
    } else if (expandedRegion === region) {
      setExpandedRegion(null);
    } else {
      setExpandedRegion(region);
    }
  };

  // Regions with at least one university matching the active search/rank (+ preferences)
  const visibleRegions = regionOrder.filter((region) => {
    if (filterByPreferences && userPreferences?.preferredRegions?.length > 0) {
      if (!userPreferences.preferredRegions.includes(region)) return false;
    }
    return (regionData[region] || []).some(matchesBaseFilters);
  });

  const regionCount = (region: string) => (regionData[region] || []).filter(matchesBaseFilters).length;

  const rowBase = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left';
  const rowActive = 'bg-[#9370DB]/10 border-[#9370DB]/50';
  const rowIdle = 'border-transparent hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary';
  const boxBase = 'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors';
  const boxActive = 'bg-[#9370DB] border-[#9370DB] text-white';
  const boxIdle = 'border-slate-300 dark:border-dark-border text-slate-400 dark:text-dark-text-secondary';

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="explore" />

      <section className="pt-16 h-screen overflow-hidden">
        <div className="flex h-full gap-0">
          {/* Left side - Regions (compare-style picker) — desktop column + mobile drawer */}
          {(() => {
            const picker = (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-[#E2E0F0] dark:border-dark-border p-4 shadow-sm flex flex-col h-full min-h-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-3 shrink-0">{t('regions')}</h2>

            {/* Search */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchUniversities')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20"
              />
            </div>

            {/* World-rank filter */}
            <div className="mb-3 shrink-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#9370DB] dark:text-dark-violet" />
                <span className="text-xs font-semibold text-slate-700 dark:text-dark-text-secondary uppercase tracking-wide">
                  {t('rankFilter')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rankBands.map((band) => (
                  <button
                    key={band.value}
                    onClick={() => setRankBand(band.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      rankBand === band.value
                        ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                        : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-600 dark:text-dark-text-secondary hover:bg-[#D8D8E8] dark:hover:bg-dark-border'
                    }`}
                  >
                    {t(band.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Major filter (from the programs table) */}
            {majorOptions.length > 0 && (
              <div className="mb-3 shrink-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-text-secondary uppercase tracking-wide mb-1.5">
                  {t('majorFilter')}
                </label>
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                >
                  <option value="All">{t('allMajors')}</option>
                  {majorOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget filter (parsed from tuition, approx. USD) */}
            <div className="mb-3 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-dark-text-secondary uppercase tracking-wide mb-1.5">
                {t('annualBudget')}
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="all">{t('allBudgets')}</option>
                {Object.keys(budgetLabelKeys).map((b) => (
                  <option key={b} value={b}>
                    {t(budgetLabelKeys[b])}
                  </option>
                ))}
              </select>
            </div>

            {userPreferences && (
              <div className="mb-3 p-3 bg-[#9370DB]/10 dark:bg-dark-violet/20 rounded-lg border border-[#9370DB]/30 dark:border-dark-violet shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterByPreferences}
                    onChange={(e) => setFilterByPreferences(e.target.checked)}
                    className="rounded border-[#9370DB] dark:border-dark-violet text-[#9370DB] dark:text-dark-violet focus:ring-[#9370DB] dark:focus:ring-dark-violet"
                  />
                  <span className="text-sm text-slate-800 dark:text-dark-text font-medium">{t('filterByMyPreferences')}</span>
                </label>
                {filterByPreferences && (
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1.5 leading-relaxed">
                    {t('preferenceFiltersApplied')}
                  </p>
                )}
              </div>
            )}

            {/* Region list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {/* All regions */}
              <button
                onClick={() => handleRegionChange(ALL_REGION)}
                className={`${rowBase} ${selectedRegion === ALL_REGION ? rowActive : rowIdle}`}
              >
                <span className={`${boxBase} ${selectedRegion === ALL_REGION ? boxActive : boxIdle}`}>
                  {selectedRegion === ALL_REGION ? <Check className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-dark-text truncate">{t('allRegions')}</span>
                  <span className="block text-xs text-slate-500 dark:text-dark-text-secondary truncate">
                    {allUniversities().filter(matchesBaseFilters).length} {t('universitiesFound')}
                  </span>
                </span>
              </button>

              {visibleRegions.map((region) => {
                const provinces = new Set((regionData[region] || []).map((uni) => uni.province).filter(Boolean));
                const isActive = selectedRegion === region;
                return (
                  <div key={region}>
                    <button
                      onClick={() => toggleRegion(region)}
                      className={`${rowBase} ${isActive ? rowActive : rowIdle}`}
                    >
                      <span className={`${boxBase} ${isActive ? boxActive : boxIdle}`}>
                        {expandedRegion === region ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-900 dark:text-dark-text truncate">{region}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#9370DB] dark:text-dark-violet shrink-0">{regionCount(region)}</span>
                    </button>
                    {expandedRegion === region && (
                      <div className="ml-7 mt-1 space-y-1">
                        {Array.from(provinces).map((province) => (
                          <button
                            key={province}
                            onClick={() => setSelectedProvince(province)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-sm ${
                              selectedProvince === province
                                ? 'bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet font-medium'
                                : 'text-slate-700 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                selectedProvince === province ? 'bg-[#9370DB] dark:bg-dark-violet' : 'bg-slate-300 dark:bg-dark-border'
                              }`}
                            />
                            {province}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {visibleRegions.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 dark:text-dark-text-secondary">{t('noRegionsMatch')}</p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-[#F0EEF8] dark:border-dark-border text-xs text-slate-500 dark:text-dark-text-secondary shrink-0">
              {getFilteredUniversities().length} {t('universitiesFound')}
            </div>
              </div>
            );
            return (
              <>
                <div className="hidden lg:block w-72 shrink-0 h-full">{picker}</div>

                {/* Mobile filters drawer */}
                {mobileFiltersOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                      onClick={() => setMobileFiltersOpen(false)}
                    />
                    <div className="fixed top-16 bottom-0 left-0 z-40 w-80 max-w-[85vw] bg-[#E8E8F0] dark:bg-dark-bg lg:hidden flex flex-col">
                      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">{t('regions')}</h2>
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-dark-text rounded-lg transition-colors"
                          aria-label="Close filters"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 min-h-0 px-2 pb-2">{picker}</div>
                    </div>
                  </>
                )}
              </>
            );
          })()}

          {/* Right side - Universities */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background Carousel */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 left-0 lg:left-[-256px] right-0">
              {getFilteredUniversities().map((uni, index) => (
                <div
                  key={uni.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBgIndex ? 'opacity-20' : 'opacity-0'
                  }`}
                >
                  <img src={uni.image} alt={uni.name} className="w-full h-full object-cover blur-sm" />
                </div>
              ))}
            </div>

            {/* Mobile toolbar: search + filters + region chips */}
            <div className="lg:hidden absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2 bg-[#E8E8F0] dark:bg-dark-bg border-b border-[#A8A8C8]/60 dark:border-dark-border shadow-sm">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchUniversities')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20"
                  />
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg text-sm font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors shadow-sm shadow-[#9370DB]/30 shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('filters')}
                </button>
              </div>
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                {[ALL_REGION, ...visibleRegions].map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionChange(region)}
                    className={`snap-start whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedRegion === region
                        ? 'bg-[#9370DB] dark:bg-dark-violet text-white shadow-sm shadow-[#9370DB]/30'
                        : 'bg-white dark:bg-dark-bg-secondary text-slate-700 dark:text-dark-text-secondary border border-[#E2E0F0] dark:border-dark-border'
                    }`}
                  >
                    {region === ALL_REGION ? t('allRegions') : region}
                  </button>
                ))}
              </div>
            </div>

            <div className={`relative z-10 space-y-3 transition-opacity duration-300 p-4 pt-32 lg:p-8 lg:pt-8 h-full overflow-y-auto ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {getFilteredUniversities().map((uni, index) => (
                <div
                  key={uni.id}
                  onClick={() => handleUniClick(uni)}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.35)}s` }}
                  className={`bg-[#C8C8E0] dark:bg-dark-bg-secondary border rounded-lg p-4 transition-colors cursor-pointer flex items-center justify-between animate-rise-in ${
                    selectedUni?.id === uni.id ? 'border-[#9370DB] dark:border-dark-violet bg-[#D8D8E8] dark:bg-dark-bg-tertiary' : 'border-[#A8A8C8] dark:border-dark-border hover:border-[#9370DB] dark:hover:border-dark-violet'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-1">{uni.name}</h3>
                      {uni.rankings?.overall && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-semibold">
                          <Trophy className="w-3 h-3" />#{uni.rankings.overall}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 dark:text-dark-text-secondary">{uni.location}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {(programsByUni.get(uni.id)?.length || 0) > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium">
                          {t('programsN', { n: String(programsByUni.get(uni.id)?.length || 0) })}
                        </span>
                      )}
                      {(scholarshipsByUni.get(uni.id)?.length || 0) > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                          {t('scholarshipsN', { n: String(scholarshipsByUni.get(uni.id)?.length || 0) })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveUniversity(uni);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isUniversitySaved(uni.id)
                        ? 'text-[#9370DB] dark:text-dark-violet'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                  >
                    <Bookmark className="w-6 h-6" fill={isUniversitySaved(uni.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
              {getFilteredUniversities().length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-slate-500 dark:text-dark-text-secondary">{t('noUniversitiesFound')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Panel — full-screen overlay on mobile, column on desktop */}
          {selectedUni && (
            <div className="fixed inset-x-0 top-16 bottom-0 z-40 lg:static lg:inset-auto w-full lg:w-96 lg:h-full bg-[#C8C8E0] dark:bg-dark-bg-secondary lg:border-l border-[#A8A8C8] dark:border-dark-border p-6 overflow-y-auto animate-fade-in-right">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedUni(null)}
                  className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t('back')}
                </button>
                <button
                  onClick={() => toggleSaveUniversity(selectedUni)}
                  className={`p-2 rounded-lg transition-colors ${
                    isUniversitySaved(selectedUni.id)
                      ? 'text-[#9370DB] dark:text-dark-violet'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  <Bookmark className="w-6 h-6" fill={isUniversitySaved(selectedUni.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="w-full h-64 bg-white dark:bg-dark-bg-tertiary rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src={selectedUni.image} alt={selectedUni.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">{selectedUni.name}</h2>
                {selectedUni.rankings?.overall && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-xs font-semibold">
                    <Trophy className="w-3 h-3" />#{selectedUni.rankings.overall}
                  </span>
                )}
              </div>
              <p className="text-slate-800 dark:text-dark-text-secondary mb-4">{selectedUni.location}</p>
              <p className="text-slate-800 dark:text-dark-text-secondary mb-6">{selectedUni.description}</p>

              {/* Scholarships from the database */}
              {(() => {
                const sList = scholarshipsByUni.get(selectedUni.id) || [];
                if (sList.length === 0) return null;
                return (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">{t('scholarships')}</h3>
                    <ul className="space-y-2">
                      {sList.slice(0, 4).map((s, i) => (
                        <li key={i} className="bg-white dark:bg-dark-bg-tertiary rounded-lg p-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-dark-text">{s.name}</p>
                          {s.amount && (
                            <p className="text-xs text-[#9370DB] dark:text-dark-violet mt-0.5 font-medium">{s.amount}</p>
                          )}
                          {s.eligibility && (
                            <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-0.5">{s.eligibility}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              <Link
                href={`/university/${slugify(selectedUni.name)}`}
                className="block w-full px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors text-center"
              >
                {t('seeMore')}
              </Link>
            </div>
          )}
        </div>
      </section>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
