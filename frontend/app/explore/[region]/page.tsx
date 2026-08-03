'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const regionData: Record<string, { name: string; location: string; description: string; province: string; image: string }[]> = {
  'north-america': [
    { name: 'Harvard University', location: 'Cambridge, USA', description: 'Ivy League research university', province: 'Massachusetts', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop' },
    { name: 'MIT', location: 'Cambridge, USA', description: 'Leading technology and engineering school', province: 'Massachusetts', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&fit=crop' },
    { name: 'Stanford University', location: 'Stanford, USA', description: 'Silicon Valley research university', province: 'California', image: 'https://images.unsplash.com/photo-1571269259264-5ccb2e888cbe?w=800&h=600&fit=crop' },
    { name: 'Yale University', location: 'New Haven, USA', description: 'Ivy League liberal arts college', province: 'Connecticut', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop' },
  ],
  'europe': [
    { name: 'University of Oxford', location: 'Oxford, UK', description: 'Oldest English-speaking university', province: 'England', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800&h=600&fit=crop' },
    { name: 'University of Cambridge', location: 'Cambridge, UK', description: 'Historic research university', province: 'England', image: 'https://images.unsplash.com/photo-1592500565497-991d3e2e5f9a?w=800&h=600&fit=crop' },
    { name: 'ETH Zurich', location: 'Zurich, Switzerland', description: 'Leading technical university', province: 'Zurich', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
    { name: 'Imperial College London', location: 'London, UK', description: 'Science-based institution', province: 'England', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop' },
  ],
  'asia': [
    { name: 'National University of Singapore', location: 'Singapore', description: 'Leading Asian university', province: 'Singapore', image: 'https://images.unsplash.com/photo-1525635313341-29744db9f37d?w=800&h=600&fit=crop' },
    { name: 'Tsinghua University', location: 'Beijing, China', description: 'Leading Chinese university', province: 'Beijing', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop' },
    { name: 'University of Tokyo', location: 'Tokyo, Japan', description: 'Japan\'s top university', province: 'Tokyo', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
    { name: 'Peking University', location: 'Beijing, China', description: 'Historic Chinese university', province: 'Beijing', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop' },
  ],
  'oceania': [
    { name: 'Australian National University', location: 'Canberra, Australia', description: 'National research university', province: 'Australian Capital Territory', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
    { name: 'University of Melbourne', location: 'Melbourne, Australia', description: 'Australia\'s top university', province: 'Victoria', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop' },
    { name: 'University of Sydney', location: 'Sydney, Australia', description: 'Leading Australian university', province: 'New South Wales', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&h=600&fit=crop' },
  ],
  'south-america': [
    { name: 'University of São Paulo', location: 'São Paulo, Brazil', description: 'Brazil\'s largest university', province: 'São Paulo', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop' },
    { name: 'University of Buenos Aires', location: 'Buenos Aires, Argentina', description: 'Argentina\'s top university', province: 'Buenos Aires', image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&h=600&fit=crop' },
  ],
  'africa': [
    { name: 'University of Cape Town', location: 'Cape Town, South Africa', description: 'Africa\'s leading university', province: 'Western Cape', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop' },
    { name: 'Stellenbosch University', location: 'Stellenbosch, South Africa', description: 'Top South African university', province: 'Western Cape', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop' },
  ],
};

const regionNames: Record<string, string> = {
  'north-america': 'North America',
  'europe': 'Europe',
  'asia': 'Asia',
  'oceania': 'Oceania',
  'south-america': 'South America',
  'africa': 'Africa',
};

export default function RegionPage() {
  const params = useParams();
  const region = params.region as string;
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedUni, setSelectedUni] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(region);

  const universities = regionData[region] || [];
  const regionName = regionNames[region] || 'Region';

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Preserve profile data before clearing user
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      localStorage.setItem('userProfileData', JSON.stringify({
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#C8C8E0] border-b border-[#A8A8C8]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
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
              <div className="hidden md:flex items-center gap-6">
                <Link href="/explore" className="text-slate-800 hover:text-[#9370DB] transition-colors text-sm">
                  Explore
                </Link>
                {!user ? (
                  <>
                    <Link href="/login" className="text-slate-800 hover:text-[#9370DB] transition-colors text-sm">
                      Login
                </Link>
                    <Link href="/signup" className="text-slate-800 hover:text-[#9370DB] transition-colors text-sm">
                      Sign Up
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Region Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/explore" className="text-[#9370DB] hover:underline text-sm">
              ← Back to regions
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Universities in {regionName}
          </h1>

          <div className="flex gap-8">
            {/* Left side - Universities */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-4">
                {getFilteredUniversities().map((uni, index) => (
                  <div
                    key={index}
                    onClick={() => handleUniClick(uni)}
                    className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-6 hover:border-[#9370DB] transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold text-slate-900 mb-2">{uni.name}</h3>
                    <p className="text-sm text-slate-800">{uni.location}</p>
                  </div>
                ))}
              </div>

              {getFilteredUniversities().length === 0 && (
                <p className="text-slate-800">No universities found for this region.</p>
              )}
            </div>

            {/* Right side - Provinces */}
            <div className="w-64">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Provinces in {regionName}
              </h2>
              <div className="space-y-2">
                {getProvinces().map((province) => (
                  <button
                    key={province}
                    onClick={() => setSelectedProvince(province)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
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
