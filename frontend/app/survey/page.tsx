'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handleSkip = () => {
    localStorage.setItem('surveyCompleted', 'true');
    router.push('/explore');
  };

  const handleSubmit = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    localStorage.setItem('surveyCompleted', 'true');
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tell us about yourself</h1>
        <p className="text-slate-800 mb-6">This helps us find the best universities for you</p>

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
              <label className="block text-slate-900 font-medium mb-2">What do you want to study?</label>
              <input
                type="text"
                value={preferences.intendedMajor}
                onChange={(e) => setPreferences(prev => ({ ...prev, intendedMajor: e.target.value }))}
                placeholder="e.g., Computer Science, Business, Medicine"
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">What degree level?</label>
              <select
                value={preferences.degreeLevel}
                onChange={(e) => setPreferences(prev => ({ ...prev, degreeLevel: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">Select degree level</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD / Doctorate</option>
                <option value="associate">Associate Degree</option>
                <option value="certificate">Certificate / Diploma</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">Preferred Regions</label>
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
              <label className="block text-slate-900 font-medium mb-2">Specific Countries (optional)</label>
              <input
                type="text"
                value={preferences.preferredCountries.join(', ')}
                onChange={(e) => setPreferences(prev => ({ ...prev, preferredCountries: e.target.value.split(',').map(c => c.trim()).filter(c => c) }))}
                placeholder="e.g., USA, UK, Canada, Australia"
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">Annual Budget (USD)</label>
              <select
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">Select budget range</option>
                <option value="0-10000">Under $10,000</option>
                <option value="10000-20000">$10,000 - $20,000</option>
                <option value="20000-30000">$20,000 - $30,000</option>
                <option value="30000-40000">$30,000 - $40,000</option>
                <option value="40000-50000">$40,000 - $50,000</option>
                <option value="50000+">$50,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">Your GPA (optional)</label>
              <input
                type="text"
                value={preferences.gpa}
                onChange={(e) => setPreferences(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder="e.g., 3.5, 85%, A"
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">Language Requirements</label>
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
              <label className="block text-slate-900 font-medium mb-2">Study Mode</label>
              <select
                value={preferences.studyMode}
                onChange={(e) => setPreferences(prev => ({ ...prev, studyMode: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">Select study mode</option>
                <option value="on-campus">On-campus</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any mode</option>
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-900 font-medium mb-2">When do you want to start?</label>
              <select
                value={preferences.startDate}
                onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 focus:outline-none focus:border-[#9370DB]"
              >
                <option value="">Select start date</option>
                <option value="immediate">As soon as possible</option>
                <option value="fall-2026">Fall 2026</option>
                <option value="spring-2027">Spring 2027</option>
                <option value="fall-2027">Fall 2027</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 font-medium mb-2">Extracurricular Activities / Interests (optional)</label>
              <textarea
                value={preferences.extracurriculars}
                onChange={(e) => setPreferences(prev => ({ ...prev, extracurriculars: e.target.value }))}
                placeholder="Tell us about your hobbies, sports, clubs, volunteer work, etc."
                rows={3}
                className="w-full px-4 py-3 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-[#A8A8C8] text-slate-900 rounded-lg hover:bg-[#A8A8C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-slate-800 hover:text-[#9370DB] transition-colors"
            >
              Skip
            </button>
            {step === 5 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
