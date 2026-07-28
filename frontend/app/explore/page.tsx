'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const regionData: Record<string, { name: string; location: string; description: string; province: string; image: string }[]> = {
  'North America': [
    { name: 'Harvard University', location: 'Cambridge, USA', description: 'Ivy League research university', province: 'Massachusetts', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop' },
    { name: 'MIT', location: 'Cambridge, USA', description: 'Leading technology and engineering school', province: 'Massachusetts', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&fit=crop' },
    { name: 'Stanford University', location: 'Stanford, USA', description: 'Silicon Valley research university', province: 'California', image: 'https://images.unsplash.com/photo-1571269259264-5ccb2e888cbe?w=800&h=600&fit=crop' },
    { name: 'Yale University', location: 'New Haven, USA', description: 'Ivy League liberal arts college', province: 'Connecticut', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop' },
  ],
  'Europe': [
    { name: 'University of Oxford', location: 'Oxford, UK', description: 'Oldest English-speaking university', province: 'England', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800&h=600&fit=crop' },
    { name: 'University of Cambridge', location: 'Cambridge, UK', description: 'Historic research university', province: 'England', image: 'https://images.unsplash.com/photo-1592500565497-991d3e2e5f9a?w=800&h=600&fit=crop' },
    { name: 'ETH Zurich', location: 'Zurich, Switzerland', description: 'Leading technical university', province: 'Zurich', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
    { name: 'Imperial College London', location: 'London, UK', description: 'Science-based institution', province: 'England', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop' },
  ],
  'Asia': [
    { name: 'National University of Singapore', location: 'Singapore', description: 'Leading Asian university', province: 'Singapore', image: 'https://images.unsplash.com/photo-1525635313341-29744db9f37d?w=800&h=600&fit=crop' },
    { name: 'Tsinghua University', location: 'Beijing, China', description: 'Leading Chinese university', province: 'Beijing', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop' },
    { name: 'University of Tokyo', location: 'Tokyo, Japan', description: 'Japan\'s top university', province: 'Tokyo', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
    { name: 'Peking University', location: 'Beijing, China', description: 'Historic Chinese university', province: 'Beijing', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop' },
  ],
  'Oceania': [
    { name: 'Australian National University', location: 'Canberra, Australia', description: 'National research university', province: 'Australian Capital Territory', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
    { name: 'University of Melbourne', location: 'Melbourne, Australia', description: 'Australia\'s top university', province: 'Victoria', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop' },
    { name: 'University of Sydney', location: 'Sydney, Australia', description: 'Leading Australian university', province: 'New South Wales', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
  ],
  'South America': [
    { name: 'University of São Paulo', location: 'São Paulo, Brazil', description: 'Brazil\'s largest university', province: 'São Paulo', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop' },
    { name: 'University of Buenos Aires', location: 'Buenos Aires, Argentina', description: 'Argentina\'s top university', province: 'Buenos Aires', image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&h=600&fit=crop' },
  ],
  'Africa': [
    { name: 'University of Cape Town', location: 'Cape Town, South Africa', description: 'Africa\'s leading university', province: 'Western Cape', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop' },
    { name: 'Stellenbosch University', location: 'Stellenbosch, South Africa', description: 'Top South African university', province: 'Western Cape', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop' },
  ],
};

export default function Explore() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('North America');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedUni, setSelectedUni] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>('North America');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const universities = getFilteredUniversities();
      if (universities.length > 0) {
        setCurrentBgIndex((prev) => (prev + 1) % universities.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedRegion, selectedProvince]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
  };

  const handleUniClick = (uni: any) => {
    setSelectedUni(uni);
    setModalOpen(true);
  };

  const handleRegionChange = (region: string) => {
    setIsAnimating(true);
    setSelectedRegion(region);
    setSelectedProvince('All');
    setExpandedRegion(region);
    setCurrentBgIndex(0);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleRegion = (region: string) => {
    if (expandedRegion === region) {
      setExpandedRegion(null);
    } else {
      setExpandedRegion(region);
      setSelectedRegion(region);
      setSelectedProvince('All');
      setCurrentBgIndex(0);
    }
  };

  const getProvinces = () => {
    const provinces = new Set(regionData[selectedRegion]?.map(uni => uni.province) || []);
    return ['All', ...Array.from(provinces)];
  };

  const getFilteredUniversities = () => {
    if (selectedProvince === 'All') {
      return regionData[selectedRegion] || [];
    }
    return regionData[selectedRegion]?.filter(uni => uni.province === selectedProvince) || [];
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#C8C8E0] border-b border-[#A8A8C8]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/explore" className="text-slate-800  hover:text-[#9370DB] transition-colors text-sm">
                Explore
              </Link>
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#9370DB] flex items-center justify-center text-white text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-800 text-sm">Welcome, {user.name || user.email}</span>
                    <span className="text-slate-800 hover:text-[#9370DB] transition-colors text-xs ml-2 transform transition-transform duration-200">
                      {dropdownOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg shadow-lg py-2 w-48 z-50 animate-fade-in-down">
                      <button className="w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                        My Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                        Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-[#ff6b6b] hover:bg-[#ffe2e2] transition-colors text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-6">
              {!user ? (
                <>
                  <Link href="/login" className="text-slate-800  hover:text-[#9370DB] transition-colors text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="text-slate-800  hover:text-[#9370DB] transition-colors text-sm">
                    Sign Up
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Explore Section */}
      <section className="pt-16 h-screen">
        <div className="flex gap-8 h-full">
          {/* Left side - Regions with nested Provinces */}
          <div className="w-64 bg-[#C8C8E0] p-4 h-full">
            <div className="space-y-2">
              {Object.keys(regionData).map((region) => {
                const provinces = new Set(regionData[region]?.map(uni => uni.province) || []);
                return (
                  <div key={region}>
                    <button
                      onClick={() => toggleRegion(region)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between items-center ${
                        selectedRegion === region
                          ? 'bg-[#9370DB] text-white'
                          : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                      }`}
                    >
                      <span>{region}</span>
                      <span className="text-xs">{expandedRegion === region ? '▲' : '▼'}</span>
                    </button>
                    {expandedRegion === region && (
                      <div className="ml-4 mt-2 space-y-1 animate-fade-in-down">
                        <button
                          onClick={() => setSelectedProvince('All')}
                          className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                            selectedProvince === 'All'
                              ? 'bg-[#9370DB] text-white'
                              : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                          }`}
                        >
                          All
                        </button>
                        {Array.from(provinces).map((province) => (
                          <button
                            key={province}
                            onClick={() => setSelectedProvince(province)}
                            className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                              selectedProvince === province
                                ? 'bg-[#9370DB] text-white'
                                : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                            }`}
                          >
                            {province}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Universities */}
          <div className="flex-1 relative">
            {/* Background Carousel */}
            <div className="absolute inset-0 -left-8 -right-8 -top-8 -bottom-8 overflow-hidden pointer-events-none z-0">
              {getFilteredUniversities().map((uni, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBgIndex ? 'opacity-20' : 'opacity-0'
                  }`}
                >
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover blur-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className={`relative z-10 space-y-3 transition-opacity duration-300 p-8 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {getFilteredUniversities().map((uni, index) => (
                <div
                  key={index}
                  onClick={() => handleUniClick(uni)}
                  className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-4 hover:border-[#9370DB] transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold text-slate-900 mb-1">{uni.name}</h3>
                  <p className="text-sm text-slate-800">{uni.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedUni && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-6 max-w-2xl w-full animate-fade-in-down">
            <img 
              src={selectedUni.image} 
              alt={selectedUni.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedUni.name}</h2>
            <p className="text-slate-800 mb-4">{selectedUni.location}</p>
            <p className="text-slate-800 mb-6">{selectedUni.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-[#A8A8C8] text-slate-900 rounded hover:bg-[#A8A8C8] transition-colors"
              >
                Close
              </button>
              <Link
                href={`/university/${selectedUni.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-[#9370DB] text-white rounded hover:bg-[#7B68EE] transition-colors"
                onClick={() => setModalOpen(false)}
              >
                See More
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
