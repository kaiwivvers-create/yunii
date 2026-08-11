'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MathCaptcha from '@/components/MathCaptcha';
import LegalModal from '@/components/LegalModal';
import { getPreservedProfileFor } from '@/utils/preservedProfile';
import { useLanguage } from '@/contexts/LanguageContext';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Google reCAPTCHA checkbox (only rendered when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set). */
function RecaptchaField({ onVerified }: { onVerified: (ok: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const w = window as any;
      if (w.grecaptcha && ref.current) {
        w.grecaptcha.render(ref.current, {
          sitekey: siteKey,
          callback: () => onVerified(true),
          'expired-callback': () => onVerified(false),
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [onVerified]);
  return <div ref={ref} />;
}

export default function Signup() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaOk, setCaptchaOk] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (!captchaOk) {
      setError(t('captchaRequired'));
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Load preserved profile data (custom name/picture) if it belongs to this account
        const preservedProfile = getPreservedProfileFor(data.user);
        const mergedUser = {
          ...data.user,
          // Use preserved profile data if it exists (same account only)
          profilePicture: preservedProfile ? preservedProfile.profilePicture : data.user.profilePicture,
          name: preservedProfile ? preservedProfile.name : data.user.name,
        };
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        // Dispatch event to notify components of user update
        window.dispatchEvent(new Event('userLogin'));
        
        router.push('/survey');
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || t('signupFailed'));
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="signup" />
      
      <div className="flex items-stretch h-[calc(100vh-4rem)]">
        {/* Left side - Background Image with Text Overlay */}
        <div className="hidden lg:block w-1/2 h-full relative">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800&fit=crop"
            alt="University"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center p-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              {t('createAnAccount')}
            </h1>
            <p className="text-2xl text-white/90">
              {t('startYourJourney')}
            </p>
          </div>
        </div>

        {/* Right side - White Form */}
        <div className="w-full lg:w-1/2 bg-white flex overflow-y-auto">
          <div className="m-auto w-full max-w-md px-6 py-10 sm:p-8 lg:p-16 animate-rise-in">
            <div className="mb-8">
              <p className="text-base text-slate-600">
                {t('alreadyHaveAccount')}{' '}
                <Link href="/login" className="text-[#9370DB] hover:underline font-medium">
                  {t('signIn')}
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t('signUpForUniverse')}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t('createYourAccount')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                  {t('fullName')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="Kai Han"
                />
              </div>

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
                  minLength={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-slate-300 text-[#9370DB] focus:ring-[#9370DB]"
                />
                <span className="ml-2 text-sm text-slate-600">
                  {t('iAgreeTo')}{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="text-[#9370DB] hover:underline font-medium cursor-pointer"
                  >
                    {t('termsOfService')}
                  </button>{' '}
                  {t('and')}{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="text-[#9370DB] hover:underline font-medium cursor-pointer"
                  >
                    {t('privacyPolicy')}
                  </button>
                </span>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              {RECAPTCHA_SITE_KEY ? (
                <RecaptchaField onVerified={setCaptchaOk} />
              ) : (
                <MathCaptcha onVerified={setCaptchaOk} />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-md font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('creatingAccount') : t('createAccountBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <LegalModal
        open={legalModal !== null}
        type={legalModal ?? 'terms'}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}
