import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { GraduationCap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      <Navbar currentPage="home" />
      <div className="flex flex-col items-center justify-center px-4 pt-36 pb-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#9370DB]/10 flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-[#9370DB]" />
        </div>
        <p className="text-7xl font-bold text-[#9370DB] leading-none">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text mt-4">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-dark-text-secondary mt-2 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Double-check the
          address, or head back to the homepage.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
