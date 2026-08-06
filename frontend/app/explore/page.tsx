'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import LoginModal from '@/components/LoginModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadUserData, saveUserData } from '@/utils/userStorage';
import { Bookmark, ChevronLeft, ChevronDown, ChevronRight, Trophy, Search, Globe, Check } from 'lucide-react';

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const rankBands: { labelKey: string; value: string; max?: number }[] = [
  { labelKey: 'all', value: 'all' },
  { labelKey: 'top10', value: 'top10', max: 10 },
  { labelKey: 'top25', value: 'top25', max: 25 },
  { labelKey: 'top50', value: 'top50', max: 50 },
  { labelKey: 'top100', value: 'top100', max: 100 },
];

const ALL_REGION = 'All';

export default function Explore() {
  const { t } = useLanguage();
  const [regionData, setRegionData] = useState<Record<string, any[]>>({});
  const [regionOrder, setRegionOrder] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>(ALL_REGION);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
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
        ...(Array.isArray(uni.undergraduate) ? uni.undergraduate : []),
        ...(Array.isArray(uni.graduate) ? uni.graduate : []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  };

  const allUniversities = () => Object.values(regionData).flat();

  const getFilteredUniversities = () => {
    const pool = selectedRegion === ALL_REGION ? allUniversities() : regionData[selectedRegion] || [];
    let universities = pool.filter(matchesBaseFilters);

    if (selectedProvince !== 'All') {
      universities = universities.filter((uni) => uni.province === selectedProvince);
    }

    if (filterByPreferences && userPreferences?.preferredRegions?.length > 0) {
      universities = universities.filter((uni) => userPreferences.preferredRegions.includes(uni.region));
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

  // Load live university data from the backend
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/universities').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/regions').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([unis, regions]: [any[], string[]]) => {
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
  }, [selectedRegion, selectedProvince, rankBand, searchQuery, filterByPreferences]);

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
          {/* Left side - Regions (compare-style picker) */}
          <div className="w-72 shrink-0 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-[#E2E0F0] dark:border-dark-border p-4 shadow-sm flex flex-col h-full min-h-0">
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

          {/* Right side - Universities */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background Carousel */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ left: '-256px', right: '0' }}>
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

            <div className={`relative z-10 space-y-3 transition-opacity duration-300 p-8 h-full overflow-y-auto ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
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

          {/* Right Side Panel */}
          {selectedUni && (
            <div className="w-96 bg-[#C8C8E0] dark:bg-dark-bg-secondary border-l border-[#A8A8C8] dark:border-dark-border p-6 overflow-y-auto animate-fade-in-right">
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
