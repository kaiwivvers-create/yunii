'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Navbar - Loaded user:', parsedUser);
        console.log('Navbar - User role:', parsedUser.role);
        console.log('Navbar - Is admin?', parsedUser.role === 'admin');
        setUser(parsedUser);
      } else {
        console.log('Navbar - No user found in localStorage');
      }
    };
    
    loadUser();

    // Update user when localStorage changes
    const handleStorageChange = () => {
      loadUser();
    };
    
    // Update user when custom login event is dispatched
    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserUpdate);
    };
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
    router.push('/');
  };

  const isAuthPage = currentPage === 'login' || currentPage === 'signup';

  return (
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
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-slate-800 text-sm">Welcome, {user.name || user.email}</span>
                  <span className="text-slate-800 hover:text-[#9370DB] transition-colors text-xs ml-2 transform transition-transform duration-200">
                    {dropdownOpen ? '▲' : '▼'}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg shadow-lg py-2 w-48 z-50 animate-fade-in-down">
                    <a href="/profile" className="block w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                      My Profile
                    </a>
                    <a href="/settings" className="block w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                      Settings
                    </a>
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
              <Link href="/explore" className="text-black hover:text-[#9370DB] transition-colors text-sm">
                Explore
              </Link>
              <Link href="/chat" className="text-black hover:text-[#9370DB] transition-colors text-sm">
                Chat
              </Link>
              {user?.role === 'admin' && (
                <div 
                  className="relative"
                  onMouseEnter={() => setAdminDropdownOpen(true)}
                  onMouseLeave={() => setAdminDropdownOpen(false)}
                >
                  <button 
                    className="flex items-center gap-2 text-[#9370DB] hover:text-[#7B68EE] transition-colors text-sm"
                  >
                    Admin
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {adminDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-black border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
                      <a href="/admin" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                        Universities
                      </a>
                      <a href="/admin" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                        Users
                      </a>
                      <a href="/settings" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">
                        Settings
                      </a>
                    </div>
                  )}
                </div>
              )}
              {!user ? (
                <Link href="/login" className="text-slate-800 hover:text-[#9370DB] transition-colors text-sm">
                  Login
                </Link>
              ) : null}
            </div>
          {!user && (
            <>
              {isAuthPage ? (
                <span className="px-4 py-2 bg-[#9370DB] text-white rounded text-sm font-medium cursor-default opacity-60">
                  {currentPage === 'login' ? 'Sign Up' : 'Sign Up'}
                </span>
              ) : (
                <Link href="/signup" className="px-4 py-2 bg-[#9370DB] text-white rounded text-sm font-medium hover:bg-[#7B68EE] transition-colors">
                  Get Started
                </Link>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}
