'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import LoginModal from '@/components/LoginModal';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const regionNames: Record<string, string> = {
  'north-america': 'North America',
  'europe': 'Europe',
  'asia': 'Asia',
  'oceania': 'Oceania',
  'south-america': 'South America',
  'africa': 'Africa',
};

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export default function RegionPage() {
  const { t } = useLanguage();
  const params = useParams();
  const region = params.region as string;
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedUni, setSelectedUni] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(region);
  const [universities, setUniversities] = useState<any[]>([]);

  const regionName = regionNames[region] || 'Region';

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load universities for this region from the database
    let cancelled = false;
    fetch('/api/admin/universities')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: any[]) => {
        if (cancelled) return;
        const filtered = list.filter(
          (u) => u.region && slugify(u.region) === region,
        );
        setUniversities(filtered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [region]);

  const handleLogout = () => {
    // Preserve profile data before clearing user
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      localStorage.setItem('userProfileData', JSON.stringify({
        email: parsedUser.email,
        name: parsedUser.name,
        profilePicture: parsedUser.profilePicture,
      }));
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
  };

  const handleUniClick = (uni: any) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSelectedUni(uni);
    setModalOpen(true);
  };

  const getProvinces = () => {
    const provinces = new Set(universities.map(uni => uni.province));
    return ['All', ...Array.from(provinces)];
  };

  const getFilteredUniversities = () => {
    if (selectedProvince === 'All') {
      return universities;
    }
    return universities.filter(uni => uni.province === selectedProvince);
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      {/* Navigation */}
      <Navbar currentPage="explore" />

      {/* Region Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/explore" className="inline-flex items-center gap-1.5 text-[#9370DB] hover:underline text-sm">
              <ChevronLeft className="w-4 h-4" />
              {t('backToRegions')}
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {t('universitiesIn', { region: regionName })}
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Universities */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-4">
                {getFilteredUniversities().map((uni, index) => (
                  <div
                    key={uni.id || index}
                    onClick={() => handleUniClick(uni)}
                    className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-6 hover:border-[#9370DB] transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold text-slate-900 mb-2">{uni.name}</h3>
                    <p className="text-sm text-slate-800">{uni.location}</p>
                  </div>
                ))}
              </div>

              {getFilteredUniversities().length === 0 && (
                <p className="text-slate-800">{t('noUniversitiesFoundForRegion')}</p>
              )}
            </div>

            {/* Right side - Provinces (horizontal chips on mobile, column on desktop) */}
            <div className="md:w-64 shrink-0">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {t('provincesIn', { region: regionName })}
              </h2>
              <div className="flex flex-wrap md:flex-col gap-2">
                {getProvinces().map((province) => (
                  <button
                    key={province}
                    onClick={() => setSelectedProvince(province)}
                    className={`px-4 py-2 rounded-lg transition-colors md:w-full md:text-left ${
                      selectedProvince === province
                        ? 'bg-[#9370DB] text-white'
                        : 'bg-[#C8C8E0] text-slate-800 hover:bg-[#A8A8C8]'
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedUni && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-6 max-w-md w-full animate-fade-in-down">
            <img 
              src={selectedUni.image} 
              alt={selectedUni.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedUni.name}</h2>
            <p className="text-slate-800 mb-4">{selectedUni.location}</p>
            <p className="text-slate-800 mb-6">{selectedUni.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-[#A8A8C8] text-slate-900 rounded hover:bg-[#A8A8C8] transition-colors"
              >
                {t('close')}
              </button>
              <Link
                href={`/university/${selectedUni.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-[#9370DB] text-white rounded hover:bg-[#7B68EE] transition-colors"
                onClick={() => setModalOpen(false)}
              >
                {t('seeMore')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
