'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const universities = [
  { name: 'Harvard University', location: 'Cambridge, USA', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop' },
  { name: 'East China Normal University', location: 'Shanghai, China', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800&fit=crop' },
  { name: 'Stanford University', location: 'Stanford, USA', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop' },
  { name: 'University of Oxford', location: 'Oxford, UK', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=800&fit=crop' },
  { name: 'MIT', location: 'Cambridge, USA', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800&fit=crop' },
  { name: 'National University of Singapore', location: 'Singapore', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop' },
  { name: 'University of Cambridge', location: 'Cambridge, UK', image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=1200&h=800&fit=crop' },
  { name: 'Yale University', location: 'New Haven, USA', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800&fit=crop' },
  { name: 'Princeton University', location: 'Princeton, USA', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=800&fit=crop' },
  { name: 'Columbia University', location: 'New York, USA', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=800&fit=crop' },
];

export default function Home() {
  const [currentUni, setCurrentUni] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUni((prev) => (prev + 1) % universities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0] ">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#C8C8E0]  border-b border-[#A8A8C8] ">
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
                <Link href="/explore" className="text-slate-800  hover:text-[#9370DB] transition-colors text-sm">
                  Explore
                </Link>
                <Link href="/chat" className="text-slate-800  hover:text-[#9370DB] transition-colors text-sm">
                  Chat
                </Link>
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
              {!user && (
                <Link href="/signup" className="px-4 py-2 bg-[#9370DB] text-white rounded text-sm font-medium hover:bg-[#7B68EE] transition-colors">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background Carousel */}
      <div className="absolute top-16 left-0 right-0 h-[650px] overflow-hidden pointer-events-none z-0">
        {universities.map((uni, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
              index === currentUni ? 'opacity-80' : 'opacity-0'
            }`}
          >
            <img
              src={uni.image}
              alt={uni.name}
              className="w-full h-full object-cover blur-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900  mb-6">
            Find Your Perfect University
          </h1>
          <p className="text-lg text-slate-800  mb-10 max-w-2xl mx-auto">
            Discover universities and programs from around the world. Your journey to higher education starts here.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2 border border-slate-300  rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Search universities, programs, or locations..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-900  placeholder-slate-600"
              />
              <button className="px-6 py-3 bg-[#9370DB] text-white font-medium hover:bg-[#7B68EE] transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 ">150+</div>
              <div className="text-sm text-slate-800 ">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 ">10K+</div>
              <div className="text-sm text-slate-800 ">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 ">50K+</div>
              <div className="text-sm text-slate-800 ">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 ">2M+</div>
              <div className="text-sm text-slate-800 ">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <Link href="/explore">
            <button className="px-6 py-3 bg-[#9370DB] text-white rounded font-medium hover:bg-[#7B68EE] transition-colors">
              Explore Universities
            </button>
          </Link>
        </div>
      </section>


      {/* Features Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#C8C8E0] ">
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900  mb-3">
              Why UniVerse?
            </h2>
            <p className="text-slate-800 ">
              Everything you need to find your perfect university
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6">
              <h3 className="font-semibold text-slate-900  mb-2">Smart Search</h3>
              <p className="text-sm text-slate-800 ">
                Advanced filters to find universities that match your specific needs, location, and budget
              </p>
            </div>

            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6">
              <h3 className="font-semibold text-slate-900  mb-2">Detailed Insights</h3>
              <p className="text-sm text-slate-800 ">
                Comprehensive data on rankings, programs, tuition, and student life
              </p>
            </div>

            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6">
              <h3 className="font-semibold text-slate-900  mb-2">Global Network</h3>
              <p className="text-sm text-slate-800 ">
                Connect with students and alumni from universities around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900  mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-slate-800  mb-6">
            Join millions of students who found their perfect university through UniVerse
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!user && (
              <Link href="/signup">
                <button className="px-6 py-3 bg-[#9370DB] text-white rounded font-medium hover:bg-[#7B68EE] transition-colors">
                  Create Free Account
                </button>
              </Link>
            )}
            <Link href="/explore">
              <button className="px-6 py-3 border border-slate-300  text-slate-900  rounded font-medium hover:bg-slate-50  transition-colors">
                Explore Universities
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#A8A8C8]  text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-slate-800 text-sm">
                Your gateway to universities worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-slate-800 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Search Universities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compare</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-slate-800 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-slate-800 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
