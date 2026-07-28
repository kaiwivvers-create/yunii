'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
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
    <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Create an account
          </h1>
          <p className="text-slate-800">
            Start your journey to find the perfect university
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-6">
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
                className="w-full px-4 py-2 border border-[#A8A8C8] rounded-lg bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB]"
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
                className="w-full px-4 py-2 border border-[#A8A8C8] rounded-lg bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB]"
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
                className="w-full px-4 py-2 border border-[#A8A8C8] rounded-lg bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB]"
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
                className="w-full px-4 py-2 border border-[#A8A8C8] rounded-lg bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-[#A8A8C8] text-[#9370DB] focus:ring-[#9370DB]"
              />
              <span className="ml-2 text-sm text-slate-800">
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
              className="w-full px-4 py-2 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-800">
              Already have an account?{' '}
              <Link href="/login" className="text-[#9370DB] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
