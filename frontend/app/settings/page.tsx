'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

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

export default function Settings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
  const [appLanguage, setAppLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [showMyPreferences, setShowMyPreferences] = useState(false);

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
    setUser(JSON.parse(storedUser));

    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      const parsed = JSON.parse(storedPreferences);
      // Migrate intendedMajor from string to array if needed
      if (typeof parsed.intendedMajor === 'string') {
        parsed.intendedMajor = parsed.intendedMajor ? [parsed.intendedMajor] : [];
      }
      setPreferences(parsed);
    }

    const storedAppLanguage = localStorage.getItem('appLanguage');
    if (storedAppLanguage) {
      setAppLanguage(storedAppLanguage);
    }

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

  const handleLogout = () => {
    // Preserve profile data before clearing user
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      localStorage.setItem('userProfileData', JSON.stringify({
        name: parsedUser.name,
        profilePicture: parsedUser.profilePicture,
      }));
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    router.push('/login');
  };

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    localStorage.setItem('appLanguage', appLanguage);
    localStorage.setItem('theme', theme);
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    alert('Settings saved successfully!');
  };

  const toggleLanguage = (lang: string) => {
    setPreferences(prev => ({
      ...prev,
      languageRequirements: prev.languageRequirements.includes(lang)
        ? prev.languageRequirements.filter(l => l !== lang)
        : [...prev.languageRequirements, lang]
    }));
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover blur-sm opacity-20"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#C8C8E0] dark:bg-dark-bg-secondary border-b border-[#A8A8C8] dark:border-dark-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#9370DB] flex items-center justify-center text-white text-sm font-medium">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-slate-800 text-sm">Welcome, {user.name || user.email}</span>
                    <span className="text-slate-800 hover:text-[#9370DB] transition-colors text-xs ml-2 transform transition-transform duration-200">
                      {dropdownOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg shadow-lg py-2 w-48 z-50 animate-fade-in-down">
                      <a href="/profile" className="block w-full text-left px-4 py-2 text-slate-800 dark:text-dark-text hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors text-sm">
                        My Profile
                      </a>
                      <a href="/settings" className="block w-full text-left px-4 py-2 text-slate-800 dark:text-dark-text hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors text-sm">
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-[#ff6b6b] hover:bg-[#ffe2e2] dark:hover:bg-[#ff5252]/20 transition-colors text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                <a href="/" className="text-black hover:text-[#9370DB] transition-colors text-sm">
                  Home
                </a>
                <a href="/explore" className="text-black hover:text-[#9370DB] transition-colors text-sm">
                  Explore
                </a>
                <a href="/chat" className="text-black hover:text-[#9370DB] transition-colors text-sm">
                  Chat
                </a>
                {user?.role === 'admin' && (
                  <div 
                    className="relative"
                    onMouseEnter={() => setAdminDropdownOpen(true)}
                    onMouseLeave={() => setAdminDropdownOpen(false)}
                  >
                    <button 
                      className="flex items-center gap-2 text-[#9370DB] dark:text-dark-violet hover:text-[#7B68EE] dark:hover:text-dark-violet-hover transition-colors text-sm"
                    >
                      Admin
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {adminDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-black border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
                        <a href="/admin" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                          Universities
                        </a>
                        <a href="/admin" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                          Users
                        </a>
                        <a href="/settings" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                          Settings
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <section className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">Settings</h1>
        <p className="text-slate-800 dark:text-dark-text-secondary mb-8">Update your study preferences</p>

        {/* Under Construction Notice */}
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">⚠️ Under Construction</p>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">Some settings features are still being developed. Dark mode and language settings may not work correctly yet.</p>
        </div>

        {/* My Preferences Summary */}
        {showMyPreferences && (
          <div className="mb-6 p-4 bg-[#9370DB]/10 dark:bg-dark-violet/20 border border-[#9370DB] dark:border-dark-violet rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-dark-text">My Preferences</h3>
              <button
                onClick={() => setShowMyPreferences(false)}
                className="text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text text-sm"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2">
              {preferences.intendedMajor.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">Majors:</p>
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
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">Regions:</p>
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
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">Countries:</p>
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
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-1">Languages:</p>
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
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">No preferences selected yet</p>
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
            Show My Preferences
          </button>
        )}

        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 space-y-6">
          {/* Academic Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Academic Preferences</h2>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">What do you want to study?</label>
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
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="">Select degree level</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD / Doctorate</option>
                <option value="associate">Associate Degree</option>
                <option value="certificate">Certificate / Diploma</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Your GPA (optional)</label>
              <input
                type="text"
                value={preferences.gpa}
                onChange={(e) => setPreferences(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder="e.g., 3.5, 85%, A"
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              />
            </div>
          </div>

          {/* Location Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Location Preferences</h2>
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
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Specific Countries</label>
              {preferences.preferredRegions.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">Select regions above to see available countries</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getAvailableCountries().map((country) => (
                    <button
                      key={country}
                      onClick={() => toggleCountry(country)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        preferences.preferredCountries.includes(country)
                          ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                          : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-border'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Financial & Practical Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Financial & Practical Preferences</h2>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Annual Budget (USD)</label>
              <select
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
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
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Study Mode</label>
              <select
                value={preferences.studyMode}
                onChange={(e) => setPreferences(prev => ({ ...prev, studyMode: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="">Select study mode</option>
                <option value="on-campus">On-campus</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any mode</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">When do you want to start?</label>
              <select
                value={preferences.startDate}
                onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="">Select start date</option>
                <option value="immediate">As soon as possible</option>
                <option value="fall-2026">Fall 2026</option>
                <option value="spring-2027">Spring 2027</option>
                <option value="fall-2027">Fall 2027</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* Language & Other */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Language & Other</h2>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Language Requirements</label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'].map((lang) => (
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
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Extracurricular Activities / Interests (optional)</label>
              <textarea
                value={preferences.extracurriculars}
                onChange={(e) => setPreferences(prev => ({ ...prev, extracurriculars: e.target.value }))}
                placeholder="Tell us about your hobbies, sports, clubs, volunteer work, etc."
                rows={3}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet resize-none"
              />
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">App Settings</h2>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">App Language</label>
              <select
                value={appLanguage}
                onChange={(e) => setAppLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-900 dark:text-dark-text font-medium">Email Notifications</label>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">Receive updates about universities and programs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#A8A8C8] dark:bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#9370DB] dark:peer-focus:ring-dark-violet rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-w-5 after:w-5 after:transition-all peer-checked:bg-[#9370DB] dark:peer-checked:bg-dark-violet"></div>
              </label>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Account</h2>
            <div>
              <label className="block text-slate-900 dark:text-dark-text font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-600 dark:text-dark-text-secondary cursor-not-allowed focus:outline-none"
              />
              <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">Contact support to change your email</p>
            </div>
            <button
              onClick={() => alert('Password reset link sent to your email')}
              className="px-4 py-2 border border-[#A8A8C8] dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-4 border-t border-[#A8A8C8] dark:border-dark-border">
            <h2 className="text-xl font-semibold text-[#ff6b6b]">Danger Zone</h2>
            <p className="text-sm text-slate-600 dark:text-dark-text-secondary">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  alert('Account deletion request sent. You will receive an email confirmation.');
                }
              }}
              className="px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff5252] transition-colors"
            >
              Delete Account
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#A8A8C8] dark:border-dark-border">
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 border border-[#A8A8C8] dark:border-dark-border text-slate-900 dark:text-dark-text rounded-lg hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
