'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, ChevronUp, GraduationCap, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavbarProps {
  currentPage?: string;
  onToggleSidebar?: () => void;
  showHamburger?: boolean;
}

export default function Navbar({ currentPage, onToggleSidebar, showHamburger }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [appName, setAppName] = useState('UniVerse');
  const [appIcon, setAppIcon] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load app branding from settings (name + icon)
    fetch('/api/admin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!s) return;
        const name = s.appName || 'UniVerse';
        setAppName(name);
        setAppIcon(s.appIcon || '');
        document.title = `${name} - Discover Universities Worldwide`;
        if (s.appIcon) {
          let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = s.appIcon;
        }
      })
      .catch(() => {});
  }, []);

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
            {!user && (
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center overflow-hidden">
                  {appIcon ? (
                    <img src={appIcon} alt="App icon" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </div>
                <span className="font-bold text-slate-900 text-base group-hover:text-[#9370DB] transition-colors">
                  {appName}
                </span>
              </Link>
            )}
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
                  {dropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg shadow-lg py-2 w-48 z-50 animate-fade-in-down">
                    <a href="/profile" className="block w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                      {t('myProfile')}
                    </a>
                    <a href="/settings" className="block w-full text-left px-4 py-2 text-slate-800 hover:bg-[#A8A8C8] transition-colors text-sm">
                      {t('settings')}
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[#ff6b6b] hover:bg-[#ffe2e2] transition-colors text-sm"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-6">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9370DB]/15 text-[#6B4FBF] hover:bg-[#9370DB]/25 transition-colors text-xs font-semibold"
              title="Switch language / 切换语言"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === 'en' ? 'EN' : '中文'}
            </button>

            {/* Hamburger menu for sidebar toggle */}
            {showHamburger && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm transition-colors ${currentPage === 'home' ? 'text-gray-500 cursor-default' : 'text-black hover:text-[#9370DB]'}`}>
                {t('home')}
              </Link>
              <Link href="/explore" className={`text-sm transition-colors ${currentPage === 'explore' ? 'text-gray-500 cursor-default' : 'text-black hover:text-[#9370DB]'}`}>
                {t('explore')}
              </Link>
              <Link href="/compare" className={`text-sm transition-colors ${currentPage === 'compare' ? 'text-gray-500 cursor-default' : 'text-black hover:text-[#9370DB]'}`}>
                {t('compare')}
              </Link>
              <Link href="/guides" className={`text-sm transition-colors ${currentPage === 'guides' ? 'text-gray-500 cursor-default' : 'text-black hover:text-[#9370DB]'}`}>
                {t('guides')}
              </Link>
              <Link href="/chat" className={`text-sm transition-colors ${currentPage === 'chat' ? 'text-gray-500 cursor-default' : 'text-black hover:text-[#9370DB]'}`}>
                {t('chat')}
              </Link>
              {user?.role === 'admin' && (
                <div 
                  className="relative py-4 -my-2"
                  onMouseEnter={() => setAdminDropdownOpen(true)}
                  onMouseLeave={() => setAdminDropdownOpen(false)}
                >
                  <button 
                    className="flex items-center gap-2 text-black hover:text-[#9370DB] transition-colors text-sm px-4 py-2"
                  >
                    {t('admin')}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {adminDropdownOpen && (
                    <div className="absolute top-0 right-0 mt-12 bg-black border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
                      <a href="/admin" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Overview</a>
                      <a href="/admin?section=content" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Content</a>
                      <a href="/admin/users" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Users</a>
                      <a href="/admin?section=activity" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Activity Log</a>
                      <a href="/admin?section=versions" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Versions</a>
                      <a href="/admin?section=reports" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Reports</a>
                      <a href="/admin?section=database" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Database</a>
                      <a href="/admin?section=roles" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Roles</a>
                      <a href="/admin?section=permissions" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Permissions</a>
                      <a href="/admin?section=settings" className="block w-full text-left px-4 py-2 text-white hover:bg-[#9370DB] transition-colors text-sm">Settings</a>
                    </div>
                  )}
                </div>
              )}
              {!user && !isAuthPage ? (
                <Link href="/login" className="text-slate-800 hover:text-[#9370DB] transition-colors text-sm">
                  {t('login')}
                </Link>
              ) : null}
            </div>
          {!user && (
            isAuthPage ? (
              <Link
                href={currentPage === 'login' ? '/signup' : '/login'}
                className="px-4 py-2 bg-[#9370DB] text-white rounded text-sm font-medium hover:bg-[#7B68EE] transition-colors"
              >
                {currentPage === 'login' ? t('signup') : t('signIn')}
              </Link>
            ) : (
              <Link href="/signup" className="px-4 py-2 bg-[#9370DB] text-white rounded text-sm font-medium hover:bg-[#7B68EE] transition-colors">
                {t('getStarted')}
              </Link>
            )
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}
