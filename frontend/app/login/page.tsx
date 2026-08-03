'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const surveyCompleted = localStorage.getItem('surveyCompleted');
        if (surveyCompleted !== 'true') {
          router.push('/survey');
        } else {
          router.push('/');
        }
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
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
              Welcome back
            </h1>
            <p className="text-2xl text-white/90">
              Sign in to your account to continue
            </p>
          </div>
        </div>

        {/* Right side - White Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-base text-slate-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[#9370DB] hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Sign in to UniVerse
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Welcome back! Please enter your details
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-slate-300 text-[#9370DB] focus:ring-[#9370DB]" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#9370DB] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-md font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
