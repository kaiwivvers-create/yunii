'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface SurveyOverlayProps {
  onClose: () => void;
}

export default function SurveyOverlay({ onClose }: SurveyOverlayProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  const handleSkip = () => {
    localStorage.setItem('surveyCompleted', 'true');
    onClose();
    router.push('/explore');
  };

  const handleSubmit = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    localStorage.setItem('surveyCompleted', 'true');
    onClose();
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

  const toggleMajor = (major: string) => {
    setPreferences(prev => ({
      ...prev,
      intendedMajor: prev.intendedMajor.includes(major)
        ? prev.intendedMajor.filter(m => m !== major)
        : [...prev.intendedMajor, major]
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-[#9370DB] dark:bg-dark-violet' : 'bg-[#A8A8C8] dark:bg-dark-border'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">What do you want to study?</label>
            <div className="flex flex-wrap gap-2">
              {['Computer Science', 'Business', 'Medicine', 'Engineering', 'Arts', 'Law', 'Education', 'Psychology', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'Other'].map((major) => (
                <button
                  key={major}
                  onClick={() => toggleMajor(major)}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    preferences.intendedMajor.includes(major)
                      ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                      : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-border'
                  }`}
                >
                  {major}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">What degree level?</label>
            <select
              value={preferences.degreeLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, degreeLevel: e.target.value }))}
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
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
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Preferred Regions</label>
            <div className="flex flex-wrap gap-2">
              {['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'].map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    preferences.preferredRegions.includes(region)
                      ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                      : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-border'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Annual Budget (USD)</label>
            <select
              value={preferences.budget}
              onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            >
              <option value="">Select budget range</option>
              <option value="under-20k">Under $20,000</option>
              <option value="20k-40k">$20,000 - $40,000</option>
              <option value="40k-60k">$40,000 - $60,000</option>
              <option value="60k-80k">$60,000 - $80,000</option>
              <option value="80k-100k">$80,000 - $100,000</option>
              <option value="over-100k">Over $100,000</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">GPA / Academic Performance</label>
            <input
              type="text"
              value={preferences.gpa}
              onChange={(e) => setPreferences(prev => ({ ...prev, gpa: e.target.value }))}
              placeholder="e.g., 3.5, 85%, A"
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Language Requirements</label>
            <div className="flex flex-wrap gap-2">
              {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Other'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    preferences.languageRequirements.includes(lang)
                      ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                      : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-border'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Study Mode</label>
            <select
              value={preferences.studyMode}
              onChange={(e) => setPreferences(prev => ({ ...prev, studyMode: e.target.value }))}
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            >
              <option value="">Select study mode</option>
              <option value="on-campus">On-campus</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Preferred Start Date</label>
            <select
              value={preferences.startDate}
              onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            >
              <option value="">Select start date</option>
              <option value="immediate">Immediate</option>
              <option value="fall-2024">Fall 2024</option>
              <option value="spring-2025">Spring 2025</option>
              <option value="fall-2025">Fall 2025</option>
              <option value="later">Later than 2025</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Extracurricular Activities (optional)</label>
            <textarea
              value={preferences.extracurriculars}
              onChange={(e) => setPreferences(prev => ({ ...prev, extracurriculars: e.target.value }))}
              placeholder="e.g., Sports, Music, Volunteering, Leadership roles"
              className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-[#A8A8C8] dark:border-dark-border">
        <button
          onClick={handleSkip}
          className="text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text text-sm"
        >
          Skip for now
        </button>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
