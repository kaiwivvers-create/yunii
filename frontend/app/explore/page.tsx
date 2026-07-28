'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const regionData: Record<string, { name: string; location: string }[]> = {
  'North America': [
    { name: 'Harvard University', location: 'Cambridge, USA' },
    { name: 'MIT', location: 'Cambridge, USA' },
    { name: 'Stanford University', location: 'Stanford, USA' },
    { name: 'Yale University', location: 'New Haven, USA' },
  ],
  'Europe': [
    { name: 'University of Oxford', location: 'Oxford, UK' },
    { name: 'University of Cambridge', location: 'Cambridge, UK' },
    { name: 'ETH Zurich', location: 'Zurich, Switzerland' },
    { name: 'Imperial College London', location: 'London, UK' },
  ],
  'Asia': [
    { name: 'National University of Singapore', location: 'Singapore' },
    { name: 'Tsinghua University', location: 'Beijing, China' },
    { name: 'University of Tokyo', location: 'Tokyo, Japan' },
    { name: 'Peking University', location: 'Beijing, China' },
  ],
  'Oceania': [
    { name: 'Australian National University', location: 'Canberra, Australia' },
    { name: 'University of Melbourne', location: 'Melbourne, Australia' },
    { name: 'University of Sydney', location: 'Sydney, Australia' },
  ],
  'South America': [
    { name: 'University of São Paulo', location: 'São Paulo, Brazil' },
    { name: 'University of Buenos Aires', location: 'Buenos Aires, Argentina' },
  ],
  'Africa': [
    { name: 'University of Cape Town', location: 'Cape Town, South Africa' },
    { name: 'Stellenbosch University', location: 'Stellenbosch, South Africa' },
  ],
};

export default function Explore() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                UniVerse
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/explore" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                Explore
              </Link>
              <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                Login
              </Link>
              <Link href="/signup" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                Sign Up
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Explore Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Explore by Region
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Select a region to view universities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(regionData).map((region) => (
              <Link
                key={region}
                href={`/explore/${region.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{region}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{regionData[region].length} universities</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
