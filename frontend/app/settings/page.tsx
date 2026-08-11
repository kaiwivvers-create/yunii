'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, LANG_OPTIONS } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';
import Navbar from '../../components/Navbar';
import { loadUserData, saveUserData } from '@/utils/userStorage';
import {
  CheckCircle2,
  X,
  GraduationCap,
  MapPin,
  Wallet,
  Languages,
  Settings as SettingsIcon,
  Bell,
  User,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

interface UserPreferences {
  intendedMajor: string[];
  degreeLevel: string;
  preferredRegions: string[];
  preferredCountries: string[];
  budget: string;
  gpa: string;
  languageRequirements: string[];
  extracurriculars: string;
  studyMode: string;
  startDate: string;
}

const SECTION_NAV: { id: string; labelKey: string; icon: LucideIcon }[] = [
  { id: 'academic', labelKey: 'academicPreferences', icon: GraduationCap },
  { id: 'location', labelKey: 'locationPreferences', icon: MapPin },
  { id: 'financial', labelKey: 'financialPracticalPreferences', icon: Wallet },
  { id: 'language', labelKey: 'languageOther', icon: Languages },
  { id: 'app', labelKey: 'appSettings', icon: SettingsIcon },
  { id: 'notifications', labelKey: 'notifications', icon: Bell },
  { id: 'account', labelKey: 'account', icon: User },
  { id: 'danger', labelKey: 'dangerZone', icon: AlertTriangle },
];

const SECTION_IDS = SECTION_NAV.map((s) => s.id);

export default function Settings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    intendedMajor: [],
    degreeLevel: '',
    preferredRegions: [],
    preferredCountries: [],
    budget: '',
    gpa: '',
    languageRequirements: [],
    extracurriculars: '',
    studyMode: '',
    startDate: '',
  });
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showMyPreferences, setShowMyPreferences] = useState(false);
  const [activeSection, setActiveSection] = useState('academic');
  // Email verification flow
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'send' | 'code'>('send');
  const [demoCode, setDemoCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [saveFlash, setSaveFlash] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Define countries by region
  const countriesByRegion: Record<string, string[]> = {
    'North America': ['USA', 'Canada', 'Mexico'],
    'Europe': ['UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Switzerland'],
    'Asia': ['Japan', 'South Korea', 'China', 'Singapore', 'India', 'Hong Kong', 'Taiwan'],
    'Oceania': ['Australia', 'New Zealand'],
    'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
    'Africa': ['South Africa', 'Egypt', 'Kenya', 'Morocco'],
  };

  // Get available countries based on selected regions
  const getAvailableCountries = () => {
    if (preferences.preferredRegions.length === 0) return [];
    const countries = new Set<string>();
    preferences.preferredRegions.forEach(region => {
      countriesByRegion[region]?.forEach(country => countries.add(country));
    });
    return Array.from(countries);
  };

  const toggleRegion = (region: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRegions: prev.preferredRegions.includes(region)
        ? prev.preferredRegions.filter(r => r !== region)
        : [...prev.preferredRegions, region],
      // Clear countries when regions change
      preferredCountries: []
    }));
  };

  const toggleCountry = (country: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCountries: prev.preferredCountries.includes(country)
        ? prev.preferredCountries.filter(c => c !== country)
        : [...prev.preferredCountries, country]
    }));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const storedPreferences = loadUserData<any>('userPreferences', null);
    if (storedPreferences) {
      // loadUserData already JSON-parses the stored value, so use it directly
      // (JSON.parse on the object would throw and crash the page).
      const parsed = { ...storedPreferences };
      // Migrate intendedMajor from string to array if needed
      if (typeof parsed.intendedMajor === 'string') {
        parsed.intendedMajor = parsed.intendedMajor ? [parsed.intendedMajor] : [];
      }
      setPreferences(parsed);
    }

    setEmailNotifications(loadUserData<boolean>('emailNotifications', true));
    setEmailVerified(
      parsedUser.emailVerified === true || loadUserData<boolean>('emailVerified', false)
    );

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark' | 'system');
    }

    const storedEmailNotifications = localStorage.getItem('emailNotifications');
    if (storedEmailNotifications) {
      setEmailNotifications(JSON.parse(storedEmailNotifications));
    }

    // Update user when localStorage changes
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const handleSave = () => {
    saveUserData('userPreferences', preferences);
    localStorage.setItem('theme', theme);
    saveUserData('emailNotifications', emailNotifications);
    // Also persist preferences to the database so they survive logout/login
    // and are available to the AI on any device.
    if (user?.email) {
      fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...preferences, surveyCompleted: true }),
      }).catch(() => {});
      // Always sync scores (even an empty list clears old rows, e.g. when the
      // user removed their GPA)
      const scores: { name: string; score: string; scale: string; status: string }[] = [];
      if (preferences.gpa) {
        scores.push({ name: 'GPA', score: preferences.gpa, scale: '4.0', status: 'achieved' });
      }
      fetch('/api/preferences/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, scores }),
      }).catch(() => {});
    }
    setSaveFlash(t('settingsSaved'));
    setTimeout(() => setSaveFlash(''), 2500);
  };

  const handleSendCode = async () => {
    if (!user?.email) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setDemoCode(data.demoCode || '');
        setVerifyStep('code');
      } else {
        setVerifyError(data.message || t('failedToSendCode'));
      }
    } catch {
      setVerifyError(t('serverUnreachable'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email || !codeInput.trim()) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: codeInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        saveUserData('emailVerified', true);
        setEmailVerified(true);
        setEmailNotifications(true);
        saveUserData('emailNotifications', true);
        setVerifyOpen(false);
        setSaveFlash(t('emailVerifiedEnabled'));
        setTimeout(() => setSaveFlash(''), 3000);
      } else {
        setVerifyError(
          data.reason === 'expired'
            ? t('codeExpired')
            : t('incorrectCode')
        );
      }
    } catch {
      setVerifyError(t('serverUnreachable'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setPreferences(prev => ({
      ...prev,
      languageRequirements: prev.languageRequirements.includes(lang)
        ? prev.languageRequirements.filter(l => l !== lang)
        : [...prev.languageRequirements, lang]
    }));
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scroll-spy: highlight the section currently in view
  const onContentScroll = () => {
    const container = contentRef.current;
    if (!container) return;
    const offset = container.getBoundingClientRect().top + 90;
    let current = SECTION_IDS[0];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) current = id;
    }
    setActiveSection(prev => (prev === current ? prev : current));
  };

  const sectionCardCls =
    'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-2xl p-6 sm:p-8';

  return (
    <div className="h-screen bg-[#E8E8F0] dark:bg-dark-bg overflow-hidden flex flex-col pt-16">
      <Navbar currentPage="settings" />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Desktop sidebar nav */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 overflow-y-auto border-r border-[#A8A8C8] dark:border-dark-border bg-[#C8C8E0] dark:bg-dark-bg-secondary">
          <div className="px-5 py-6 border-b border-[#A8A8C8] dark:border-dark-border">
            <h1 className="text-xl font-bold text-slate-900 dark:text-dark-text mb-1">{t('settingsTitle')}</h1>
            <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">{t('settingsSubtitle')}</p>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {SECTION_NAV.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === id
                    ? 'bg-[#9370DB] text-white shadow-sm shadow-[#9370DB]/30'
                    : 'text-slate-700 dark:text-dark-text-secondary hover:bg-[#B8B8D4] dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-left leading-snug">{t(labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section ref={contentRef} onScroll={onContentScroll} className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-10 py-8">
            {/* Mobile title */}
            <div className="md:hidden mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">{t('settingsTitle')}</h1>
              <p className="text-slate-800 dark:text-dark-text-secondary">{t('settingsSubtitle')}</p>
            </div>

            {/* Mobile section chips */}
            <div className="md:hidden sticky top-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-[#E8E8F0] dark:bg-dark-bg z-20 mb-6 border-b border-[#A8A8C8] dark:border-dark-border overflow-x-auto">
              <div className="flex gap-1.5 min-w-max">
                {SECTION_NAV.map(({ id, labelKey, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeSection === id
                        ? 'bg-[#9370DB] text-white shadow-sm shadow-[#9370DB]/30'
                        : 'bg-[#C8C8E0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#B8B8D4]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* My Preferences Summary */}
            {showMyPreferences && (
              <div className="mb-6 p-4 bg-[#9370DB]/10 dark:bg-dark-violet/20 border border-[#9370DB] dark:border-dark-violet rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-dark-text">{t('myPreferences')}</h3>
                  <button
                    onClick={() => setShowMyPreferences(false)}
                    className="text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text text-sm"
                  >
                    {t('hide')}
                  </button>
                </div>
                <div className="space-y-2">
                  {preferences.intendedMajor.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">{t('majorsLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.intendedMajor.map((major) => (
                          <button
                            key={major}
                            onClick={() => {
                              setPreferences(prev => ({
                                ...prev,
                                intendedMajor: prev.intendedMajor.filter(m => m !== major)
                              }));
                            }}
                            className="px-2 py-1 bg-[#9370DB] dark:bg-dark-violet text-white text-xs rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                          >
                            {major} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferences.preferredRegions.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">{t('regionsLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferredRegions.map((region) => (
                          <button
                            key={region}
                            onClick={() => toggleRegion(region)}
                            className="px-2 py-1 bg-[#9370DB] dark:bg-dark-violet text-white text-xs rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                          >
                            {region} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferences.preferredCountries.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">{t('countriesLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferredCountries.map((country) => (
                          <button
                            key={country}
                            onClick={() => toggleCountry(country)}
                            className="px-2 py-1 bg-[#9370DB] dark:bg-dark-violet text-white text-xs rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                          >
                            {country} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferences.languageRequirements.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">{t('languagesLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.languageRequirements.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => toggleLanguage(lang)}
                            className="px-2 py-1 bg-[#9370DB] dark:bg-dark-violet text-white text-xs rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                          >
                            {lang} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferences.intendedMajor.length === 0 && preferences.preferredRegions.length === 0 && preferences.preferredCountries.length === 0 && preferences.languageRequirements.length === 0 && (
                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{t('noPreferencesSelected')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Show My Preferences Button */}
            {!showMyPreferences && (
              <button
                onClick={() => setShowMyPreferences(true)}
                className="mb-6 w-full p-3 bg-[#9370DB]/10 dark:bg-dark-violet/20 border border-[#9370DB] dark:border-dark-violet rounded-lg text-slate-900 dark:text-dark-text font-medium hover:bg-[#9370DB]/20 dark:hover:bg-dark-violet/30 transition-colors"
              >
                {t('showMyPreferences')}
              </button>
            )}

            {/* Academic Preferences */}
            <div id="academic" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#9370DB]" />
                  {t('academicPreferences')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('whatToStudy')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['Computer Science', 'Business', 'Medicine', 'Engineering', 'Arts', 'Law', 'Education', 'Psychology', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'Other'].map((major) => (
                        <button
                          key={major}
                          onClick={() => {
                            setPreferences(prev => ({
                              ...prev,
                              intendedMajor: prev.intendedMajor.includes(major)
                                ? prev.intendedMajor.filter(m => m !== major)
                                : [...prev.intendedMajor, major]
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            preferences.intendedMajor.includes(major)
                              ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                              : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#E8E8F0] dark:hover:bg-dark-border'
                          }`}
                        >
                          {major}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('whatDegreeLevel')}</label>
                    <select
                      value={preferences.degreeLevel}
                      onChange={(e) => setPreferences(prev => ({ ...prev, degreeLevel: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      <option value="">{t('selectDegreeLevel')}</option>
                      <option value="bachelor">{t('bachelorsDegree')}</option>
                      <option value="master">{t('mastersDegree')}</option>
                      <option value="phd">{t('phdDoctorate')}</option>
                      <option value="associate">{t('associateDegree')}</option>
                      <option value="certificate">{t('certificateDiploma')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('yourGpa')}</label>
                    <input
                      type="text"
                      value={preferences.gpa}
                      onChange={(e) => setPreferences(prev => ({ ...prev, gpa: e.target.value }))}
                      placeholder={t('gpaPlaceholder')}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Preferences */}
            <div id="location" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#9370DB]" />
                  {t('locationPreferences')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('preferredRegions')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'].map((region) => (
                        <button
                          key={region}
                          onClick={() => toggleRegion(region)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            preferences.preferredRegions.includes(region)
                              ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                              : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#E8E8F0] dark:hover:bg-dark-border'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('specificCountries')}</label>
                    {preferences.preferredRegions.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{t('selectRegionsFirst')}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {getAvailableCountries().map((country) => (
                          <button
                            key={country}
                            onClick={() => toggleCountry(country)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              preferences.preferredCountries.includes(country)
                                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                                : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#E8E8F0] dark:hover:bg-dark-border'
                            }`}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Practical Preferences */}
            <div id="financial" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <Wallet className="w-5 h-5 text-[#9370DB]" />
                  {t('financialPracticalPreferences')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('annualBudget')}</label>
                    <select
                      value={preferences.budget}
                      onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      <option value="">{t('selectBudgetRange')}</option>
                      <option value="0-10000">{t('budgetUnder10k')}</option>
                      <option value="10000-20000">{t('budget10to20k')}</option>
                      <option value="20000-30000">{t('budget20to30k')}</option>
                      <option value="30000-40000">{t('budget30to40k')}</option>
                      <option value="40000-50000">{t('budget40to50k')}</option>
                      <option value="50000+">{t('budgetOver50k')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('studyMode')}</label>
                    <select
                      value={preferences.studyMode}
                      onChange={(e) => setPreferences(prev => ({ ...prev, studyMode: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      <option value="">{t('selectStudyMode')}</option>
                      <option value="on-campus">{t('onCampus')}</option>
                      <option value="online">{t('online')}</option>
                      <option value="hybrid">{t('hybrid')}</option>
                      <option value="any">{t('anyMode')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('whenToStart')}</label>
                    <select
                      value={preferences.startDate}
                      onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      <option value="">{t('selectStartDate')}</option>
                      <option value="immediate">{t('asSoonAsPossible')}</option>
                      <option value="fall-2026">Fall 2026</option>
                      <option value="spring-2027">Spring 2027</option>
                      <option value="fall-2027">Fall 2027</option>
                      <option value="flexible">{t('flexible')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Language & Other */}
            <div id="language" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <Languages className="w-5 h-5 text-[#9370DB]" />
                  {t('languageOther')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('languageRequirements')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            preferences.languageRequirements.includes(lang)
                              ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                              : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#E8E8F0] dark:hover:bg-dark-border'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('extracurriculars')}</label>
                    <textarea
                      value={preferences.extracurriculars}
                      onChange={(e) => setPreferences(prev => ({ ...prev, extracurriculars: e.target.value }))}
                      placeholder={t('extracurricularsPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div id="app" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <SettingsIcon className="w-5 h-5 text-[#9370DB]" />
                  {t('appSettings')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('appLanguage')}</label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as Lang)}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      {LANG_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1.5">{t('appLanguageHint')}</p>
                  </div>
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('theme')}</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                    >
                      <option value="light">{t('light')}</option>
                      <option value="dark">{t('dark')}</option>
                      <option value="system">{t('systemDefault')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div id="notifications" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-[#9370DB]" />
                  {t('notifications')}
                </h2>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="text-slate-900 dark:text-dark-text font-medium">{t('emailNotifications')}</label>
                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-0.5">{t('emailNotificationsDesc')}</p>
                    {emailVerified ? (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {user?.email} {t('verified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                        {t('notVerified')}
                      </span>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => {
                        if (e.target.checked && !emailVerified) {
                          // Require email verification before enabling notifications
                          setVerifyOpen(true);
                          setVerifyStep('send');
                          setDemoCode('');
                          setCodeInput('');
                          setVerifyError('');
                          setEmailNotifications(false);
                        } else {
                          setEmailNotifications(e.target.checked);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#A8A8C8] dark:bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#9370DB] dark:peer-focus:ring-dark-violet rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9370DB] dark:peer-checked:bg-dark-violet"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div id="account" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={sectionCardCls}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2.5">
                  <User className="w-5 h-5 text-[#9370DB]" />
                  {t('account')}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">{t('email')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-600 dark:text-dark-text-secondary cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">{t('changeEmailSupport')}</p>
                  </div>
                  <button
                    onClick={() => alert(t('passwordResetSent'))}
                    className="px-4 py-2 border border-[#A8A8C8] dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors"
                  >
                    {t('changePassword')}
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div id="danger" className="scroll-mt-16 md:scroll-mt-6 mb-8">
              <div className={`${sectionCardCls} border-red-200 dark:border-red-500/30`}>
                <h2 className="text-xl font-semibold text-[#ff6b6b] mb-4 flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5" />
                  {t('dangerZone')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary mb-5">{t('dangerZoneDesc')}</p>
                <button
                  onClick={() => {
                    if (confirm(t('deleteConfirm'))) {
                      alert(t('accountDeletionRequested'));
                    }
                  }}
                  className="px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff5252] transition-colors"
                >
                  {t('deleteAccount')}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mb-4">
              <button
                onClick={() => router.push('/explore')}
                className="px-6 py-3 border border-[#A8A8C8] dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors"
              >
                {t('cancel')}
              </button>
              {saveFlash && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveFlash}
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Email Verification Modal */}
      {verifyOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setVerifyOpen(false)}
        >
          <div
            className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">{t('verifyYourEmail')}</h3>
              <button
                onClick={() => setVerifyOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-800 dark:text-dark-text-secondary mb-5">
              {t('verifyEmailDesc', { email: user?.email || '' })}
            </p>

            {verifyStep === 'send' ? (
              <button
                onClick={handleSendCode}
                disabled={verifyLoading}
                className="w-full px-4 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-60"
              >
                {verifyLoading ? t('sending') : t('sendVerificationCode')}
              </button>
            ) : (
              <div className="space-y-4">
                {demoCode && (
                  <div className="p-4 bg-white dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-xl text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-dark-text-secondary mb-2">
                      {t('demoEmail', { email: user?.email || '' })}
                    </p>
                    <p className="text-slate-800 dark:text-dark-text mb-1">{t('subjectVerify')}</p>
                    <p className="text-slate-800 dark:text-dark-text">
                      {t('verificationCodeIs')}{' '}
                      <span className="font-bold text-[#9370DB] dark:text-dark-violet tracking-widest">{demoCode}</span>
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1.5">{t('sixDigitCode')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text text-center text-lg font-semibold tracking-[0.5em] placeholder-slate-400 focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
                  />
                </div>
                {verifyError && <p className="text-sm text-red-500">{verifyError}</p>}
                <button
                  onClick={handleVerifyCode}
                  disabled={verifyLoading || codeInput.length !== 6}
                  className="w-full px-4 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg font-medium hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyLoading ? t('verifying') : t('verifyEnableNotifications')}
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={verifyLoading}
                  className="w-full text-center text-sm text-slate-600 dark:text-dark-text-secondary hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors"
                >
                  {t('resendCode')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
