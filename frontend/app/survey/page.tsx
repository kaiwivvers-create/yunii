'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserData } from '@/utils/userStorage';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserPreferences {
  intendedMajor: string;
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

export default function Survey() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    intendedMajor: '',
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

  // Load previously saved preferences from the database (survives logout/login
  // and other browsers) and redirect to login when not signed in.
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(user);
      if (parsed.email) {
        fetch(`/api/preferences?email=${encodeURIComponent(parsed.email)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.preferences) {
              setPreferences((prev) => ({
                ...prev,
                ...d.preferences,
                // Settings stores majors as an array; the survey uses a single string
                intendedMajor: Array.isArray(d.preferences.intendedMajor)
                  ? d.preferences.intendedMajor[0] || ''
                  : d.preferences.intendedMajor || '',
                preferredRegions: Array.isArray(d.preferences.preferredRegions)
                  ? d.preferences.preferredRegions
                  : [],
                preferredCountries: Array.isArray(d.preferences.preferredCountries)
                  ? d.preferences.preferredCountries
                  : [],
                languageRequirements: Array.isArray(d.preferences.languageRequirements)
                  ? d.preferences.languageRequirements
                  : [],
              }));
            }
          })
          .catch(() => {});
      }
    } catch {
      /* ignore malformed user */
    }
  }, [router]);

  /** Persist preferences + derived academic scores to the database. */
  const persistPreferences = async (completed: boolean) => {
    const user = localStorage.getItem('user');
    if (!user) return;
    try {
      const email = JSON.parse(user).email;
      if (!email) return;
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...preferences, surveyCompleted: completed }),
      });
      // Always sync scores (even an empty list clears old rows, e.g. when the
      // user removed their GPA)
      const scores: { name: string; score: string; scale: string; status: string }[] = [];
      if (preferences.gpa) scores.push({ name: 'GPA', score: preferences.gpa, scale: '4.0', status: 'achieved' });
      await fetch('/api/preferences/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scores }),
      });
    } catch {
      /* offline / backend down — localStorage still has the data */
    }
  };

  const handleSkip = async () => {
    saveUserData('surveyCompleted', 'true');
    await persistPreferences(true);
    router.push('/explore');
  };

  const handleSubmit = async () => {
    saveUserData('userPreferences', preferences);
    saveUserData('surveyCompleted', 'true');
    await persistPreferences(true);
    router.push('/explore');
  };

  const toggleRegion = (region: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRegions: prev.preferredRegions.includes(region)
        ? prev.preferredRegions.filter(r => r !== region)
        : [...prev.preferredRegions, region]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setPreferences(prev => ({
      ...prev,
      languageRequirements: prev.languageRequirements.includes(lang)
        ? prev.languageRequirements.filter(l => l !== lang)
        : [...prev.languageRequirements, lang]
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center p-4">
      <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tellUsAboutYourself')}</h1>
        <p className="text-slate-800 mb-6">{t('thisHelpsUsFind')}</p>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#9370DB]' : 'bg-[#A8A8C8]'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('whatToStudy')}</label>
              <input
                type="text"
                value={preferences.intendedMajor}
                onChange={(e) => setPreferences(prev => ({ ...prev, intendedMajor: e.target.value }))}
                placeholder={t('majorPlaceholder')}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('whatDegreeLevel')}</label>
              <select
                value={preferences.degreeLevel}
                onChange={(e) => setPreferences(prev => ({ ...prev, degreeLevel: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">{t('selectDegreeLevel')}</option>
                <option value="bachelor">{t('bachelorsDegree')}</option>
                <option value="master">{t('mastersDegree')}</option>
                <option value="phd">{t('phdDoctorate')}</option>
                <option value="associate">{t('associateDegree')}</option>
                <option value="certificate">{t('certificateDiploma')}</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('preferredRegions')}</label>
              <div className="flex flex-wrap gap-2">
                {['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'].map((region) => (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      preferences.preferredRegions.includes(region)
                        ? 'bg-[#9370DB] text-white'
                        : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('specificCountries')}</label>
              <input
                type="text"
                value={preferences.preferredCountries.join(', ')}
                onChange={(e) => setPreferences(prev => ({ ...prev, preferredCountries: e.target.value.split(',').map(c => c.trim()).filter(c => c) }))}
                placeholder={t('specificCountriesPlaceholder')}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('annualBudget')}</label>
              <select
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
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
              <label className="block text-slate-900 font-medium mb-2">{t('yourGpa')}</label>
              <input
                type="text"
                value={preferences.gpa}
                onChange={(e) => setPreferences(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder={t('gpaPlaceholder')}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('languageRequirements')}</label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      preferences.languageRequirements.includes(lang)
                        ? 'bg-[#9370DB] text-white'
                        : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('studyMode')}</label>
              <select
                value={preferences.studyMode}
                onChange={(e) => setPreferences(prev => ({ ...prev, studyMode: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">{t('selectStudyMode')}</option>
                <option value="on-campus">{t('onCampus')}</option>
                <option value="online">{t('online')}</option>
                <option value="hybrid">{t('hybrid')}</option>
                <option value="any">{t('anyMode')}</option>
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('whenToStart')}</label>
              <select
                value={preferences.startDate}
                onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">{t('selectStartDate')}</option>
                <option value="immediate">{t('asSoonAsPossible')}</option>
                <option value="fall-2026">Fall 2026</option>
                <option value="spring-2027">Spring 2027</option>
                <option value="fall-2027">Fall 2027</option>
                <option value="flexible">{t('flexible')}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">{t('extracurriculars')}</label>
              <textarea
                value={preferences.extracurriculars}
                onChange={(e) => setPreferences(prev => ({ ...prev, extracurriculars: e.target.value }))}
                placeholder={t('extracurricularsPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-[#A8A8C8] text-slate-900 rounded-lg hover:bg-[#A8A8C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('previous')}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-slate-800 hover:text-[#9370DB] transition-colors"
            >
              {t('skip')}
            </button>
            {step === 5 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors"
              >
                {t('submit')}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors"
              >
                {t('next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
