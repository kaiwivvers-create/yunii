'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getPreservedProfileFor } from '@/utils/preservedProfile';
import { loadUserData } from '@/utils/userStorage';
import { isAdminRole } from '@/utils/roles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Login - Attempting login with:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('=== DEBUGGING BACKEND RESPONSE ===');
        console.log('Full backend response:', JSON.stringify(data, null, 2));
        console.log('data.user exists?', !!data.user);
        console.log('data.user:', data.user);
        console.log('data.user.role:', data.user?.role);
        console.log('=== END DEBUGGING ===');
        
        // Load preserved profile data (custom name/picture) if it belongs to this account
        const preservedProfile = getPreservedProfileFor(data.user);
        console.log('Preserved profile:', preservedProfile);
        
        // Explicitly construct user to avoid spread operator issues.
        // - name: preservedProfile wins so custom display names set before the
        //   backend persisted them keep working (it's account-scoped, so it can't
        //   leak). The backend wins whenever the local copy is absent (new device).
        // - profilePicture: the backend is authoritative so removing a photo
        //   sticks and edits made elsewhere are honored; the local copy is only a
        //   fallback for accounts edited before backend persistence existed.
        const mergedUser = {
          id: data.user.id,
          email: data.user.email,
          // Demo owner account is the Super Admin
          role: data.user.email === 'kai@example.com' ? 'super_admin' : (data.user.role || 'user'),
          name: preservedProfile?.name || data.user.name || 'User',
          profilePicture: data.user.profilePicture || preservedProfile?.profilePicture || '',
          // Carry over effective permissions from the backend so admin gating works
          permissions: data.user.permissions || [],
        };
        
        console.log('Merged user:', mergedUser); // Debug log
        console.log('Merged user role:', mergedUser.role);
        console.log('Is admin?', mergedUser.role === 'admin');
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        console.log('User saved to localStorage');
        
        // Verify it was saved correctly
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          console.log('Verified saved user:', JSON.parse(savedUser));
        }
        
        // Dispatch event to notify components of user update
        window.dispatchEvent(new Event('userLogin'));
        
        // Skip survey for admin users
        if (isAdminRole(mergedUser.role)) {
          console.log('Admin user detected, skipping survey');
          router.push('/');
          return;
        }
        
        // Legacy data may have stored surveyCompleted as a raw string ('true'),
        // which loadUserData's migration returns as the boolean `true`. Accept both.
        const surveyCompleted = loadUserData<string | boolean>('surveyCompleted', '');
        let surveyDone = surveyCompleted === 'true' || surveyCompleted === true;
        // The database is authoritative: if the survey was completed on another
        // device, don't push the user through it again.
        if (!surveyDone && mergedUser.email) {
          try {
            const prefsRes = await fetch(
              `/api/preferences?email=${encodeURIComponent(mergedUser.email)}`,
            );
            if (prefsRes.ok) {
              const prefsData = await prefsRes.json();
              if (prefsData?.preferences?.surveyCompleted) surveyDone = true;
            }
          } catch {
            // Backend unreachable — fall back to the local check
          }
        }
        if (!surveyDone) {
          router.push('/survey');
        } else {
          router.push('/');
        }
      } else {
        console.error('Login failed with status:', response.status);
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || t('loginFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="login" />
      
      <div className="flex items-stretch h-[calc(100vh-4rem)]">
        {/* Left side - Background Image with Text Overlay */}
        <div className="hidden lg:block w-1/2 h-full relative">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop"
            alt="University"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center p-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              {t('welcomeBackTitle')}
            </h1>
            <p className="text-2xl text-white/90">
              {t('signInToContinue')}
            </p>
          </div>
        </div>

        {/* Right side - White Form */}
        <div className="w-full lg:w-1/2 bg-white flex overflow-y-auto">
          <div className="m-auto w-full max-w-md px-6 py-10 sm:p-8 lg:p-16 animate-rise-in">
            <div className="mb-8">
              <p className="text-base text-slate-600">
                {t('dontHaveAccount')}{' '}
                <Link href="/signup" className="text-[#9370DB] hover:underline font-medium">
                  {t('signup')}
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t('signInToUniverse')}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t('welcomeBackDetails')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-slate-300 text-[#9370DB] focus:ring-[#9370DB]" />
                  <span className="ml-2 text-sm text-slate-600">{t('rememberMe')}</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#9370DB] hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-md font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('signingIn') : t('signIn')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
