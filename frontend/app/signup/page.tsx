'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
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
        
        // Load preserved profile data from userProfileData if it exists
        const preservedProfile = localStorage.getItem('userProfileData');
        const mergedUser = {
          ...data.user,
          // Use preserved profile data if it exists
          profilePicture: preservedProfile ? JSON.parse(preservedProfile).profilePicture : data.user.profilePicture,
          name: preservedProfile ? JSON.parse(preservedProfile).name : data.user.name,
        };
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        // Dispatch event to notify components of user update
        window.dispatchEvent(new Event('userLogin'));
        
        router.push('/survey');
      } else {
        alert('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
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
              Create an account
            </h1>
            <p className="text-2xl text-white/90">
              Start your journey to find the perfect university
            </p>
          </div>
        </div>

        {/* Right side - White Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-base text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#9370DB] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Sign up for UniVerse
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Create your account to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                  Full Name
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
                  Email
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
                  Password
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
                  Confirm Password
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
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#9370DB] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#9370DB] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-md font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
