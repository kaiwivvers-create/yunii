'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Default to light mode
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                UniVerse
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                <Link href="/explore" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Explore
                </Link>
                <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Login
                </Link>
                <Link href="/signup" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Sign Up
                </Link>
              </div>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Find Your Perfect University
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Discover universities and programs from around the world. Your journey to higher education starts here.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search universities, programs, or locations..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">150+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">10K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">50K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">2M+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/explore">
            <button className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              Explore Universities
            </button>
          </Link>
        </div>
      </section>


      {/* Features Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Why UniVerse?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Everything you need to find your perfect university
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Search</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced filters to find universities that match your specific needs, location, and budget
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Detailed Insights</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Comprehensive data on rankings, programs, tuition, and student life
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Global Network</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect with students and alumni from universities around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Join millions of students who found their perfect university through UniVerse
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              Create Free Account
            </button>
            <button className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Explore Universities
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-xl font-bold">UniVerse</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your gateway to universities worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Search Universities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compare</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 UniVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
