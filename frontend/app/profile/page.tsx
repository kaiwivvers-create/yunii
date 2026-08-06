'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '../../components/Navbar';
import ImageCropper from '@/components/ImageCropper';
import { getPreservedProfileFor } from '@/utils/preservedProfile';
import { loadUserData, saveUserData } from '@/utils/userStorage';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [savedUniversities, setSavedUniversities] = useState<any[]>([]);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Load preserved profile data (custom name/picture) if it belongs to this account
    const preservedProfile = getPreservedProfileFor(parsedUser);
    if (preservedProfile) {
      setUsername(preservedProfile.name || parsedUser.name || '');
      setProfilePicture(preservedProfile.profilePicture || parsedUser.profilePicture || '');
    } else {
      setUsername(parsedUser.name || '');
      setProfilePicture(parsedUser.profilePicture || '');
    }

    // Load saved universities
    const saved = loadUserData<any[]>('savedUniversities', []);
    if (saved.length) {
      setSavedUniversities(saved);
    }
  }, [router]);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: username,
      profilePicture,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('userProfileData', JSON.stringify({
      email: user.email,
      name: username,
      profilePicture,
    }));
    setUser(updatedUser);
    setIsEditing(false);
    // Notify the app (navbar etc.) so the new name/picture shows immediately
    window.dispatchEvent(new Event('userLogin'));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSaved = (uniId: number) => {
    const updated = savedUniversities.filter(u => u.id !== uniId);
    setSavedUniversities(updated);
    saveUserData('savedUniversities', updated);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Image Cropper */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={imageToCrop}
        title={t('cropProfilePicture')}
        round
        onCancel={() => setCropperOpen(false)}
        onConfirm={(dataUrl) => {
          setProfilePicture(dataUrl);
          setCropperOpen(false);
        }}
      />

      {/* Navigation */}
      <Navbar currentPage="profile" />

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-8">{t('myProfile')}</h1>

        {/* Profile Card */}
        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full bg-[#E8E8F0] dark:bg-dark-bg-tertiary flex items-center justify-center overflow-hidden border-4 border-[#9370DB] dark:border-dark-violet cursor-pointer"
                onClick={() => {
                  if (isEditing) {
                    if (profilePicture) {
                      setImageToCrop(profilePicture);
                      setCropperOpen(true);
                    } else {
                      const input = document.getElementById('profile-upload') as HTMLInputElement | null;
                      input?.click();
                    }
                  }
                }}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-[#9370DB] dark:text-dark-violet font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#9370DB] dark:bg-dark-violet rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors">
                    <span className="text-white text-xs">+</span>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {profilePicture && (
                    <div className="absolute -top-1 -right-1 flex gap-1">
                      <div 
                        className="w-7 h-7 bg-[#9370DB] dark:bg-dark-violet rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors shadow"
                        onClick={() => {
                          setImageToCrop(profilePicture);
                          setCropperOpen(true);
                        }}
                        title={t('reCropPhoto')}
                      >
                        <span className="text-white text-xs">✂</span>
                      </div>
                      <div 
                        className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow"
                        onClick={() => setProfilePicture('')}
                        title={t('removePhoto')}
                      >
                        <span className="text-white text-xs">✕</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1">{t('username')}</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user.name || '');
                        setProfilePicture(user.profilePicture || '');
                      }}
                      className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-1">{username}</h2>
                  <p className="text-slate-600 dark:text-dark-text-secondary mb-4">{user.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                  >
                    {t('editProfile')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b-2 border-[#A8A8C8] dark:border-dark-border mb-8"></div>

        {/* Saved Universities */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-4">{t('savedUniversities')}</h2>
          {savedUniversities.length === 0 ? (
            <p className="text-slate-600 dark:text-dark-text-secondary">{t('noSavedUniversities')}</p>
          ) : (
            <div className="grid gap-4">
              {savedUniversities.map((uni) => (
                <div
                  key={uni.id}
                  className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-dark-text">{uni.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{uni.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/university/${uni.name.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="px-3 py-1 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors text-sm"
                    >
                      {t('view')}
                    </button>
                    <button
                      onClick={() => handleRemoveSaved(uni.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
