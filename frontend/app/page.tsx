'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SurveyOverlay from '@/components/SurveyOverlay';

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
  const [showSurvey, setShowSurvey] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
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
      
      // Check if survey needs to be shown (for non-admin users)
      const surveyCompleted = localStorage.getItem('surveyCompleted');
      const parsedUser = JSON.parse(storedUser);
      
      if (surveyCompleted !== 'true' && parsedUser.role !== 'admin') {
        // Show landing page first, then blur and show survey
        setTimeout(() => {
          setIsBlurred(true);
          setTimeout(() => {
            setShowSurvey(true);
          }, 500);
        }, 1500);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#E8E8F0] relative">
      <Navbar currentPage="home" />

      {/* Background Carousel */}
      <div className={`absolute top-16 left-0 right-0 h-[650px] overflow-hidden pointer-events-none z-0 transition-all duration-500 ${isBlurred ? 'blur-md scale-105' : ''}`}>
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

      {/* Survey Overlay */}
      {showSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">Tell us about yourself</h1>
            <p className="text-slate-800 dark:text-dark-text-secondary mb-6">This helps us find the best universities for you</p>
            
            <SurveyOverlay onClose={() => {
              setShowSurvey(false);
              setIsBlurred(false);
            }} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-500 ${isBlurred ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900  mb-6 animate-rise-in">
            Find Your Perfect University
          </h1>
          <p className="text-lg text-slate-800  mb-10 max-w-2xl mx-auto animate-rise-in-1">
            Discover universities and programs from around the world. Your journey to higher education starts here.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-rise-in-2">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-rise-in-3">
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
            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6 animate-rise-in">
              <h3 className="font-semibold text-slate-900  mb-2">Smart Search</h3>
              <p className="text-sm text-slate-800 ">
                Advanced filters to find universities that match your specific needs, location, and budget
              </p>
            </div>

            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6 animate-rise-in-1">
              <h3 className="font-semibold text-slate-900  mb-2">Detailed Insights</h3>
              <p className="text-sm text-slate-800 ">
                Comprehensive data on rankings, programs, tuition, and student life
              </p>
            </div>

            <div className="bg-[#C8C8E0]  border border-slate-200  rounded-lg p-6 animate-rise-in-2">
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
                <button className="px-6 py-3 bg-[#9370DB] text-white rounded font-medium hover:bg-[#7B68EE] transition-colors animate-rise-in-3">
                  Create Free Account
                </button>
              </Link>
            )}
            <Link href="/explore">
              <button className="px-6 py-3 border border-slate-300  text-slate-900  rounded font-medium hover:bg-slate-50  transition-colors animate-rise-in-4">
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
