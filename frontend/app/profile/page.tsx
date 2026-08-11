'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '../../components/Navbar';
import ImageCropper from '@/components/ImageCropper';
import { getPreservedProfileFor } from '@/utils/preservedProfile';
import { loadUserData, saveUserData } from '@/utils/userStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, Plus, Trash2, Calendar } from 'lucide-react';

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const APP_STATUSES: { key: string; tKey: string; cls: string; dot: string }[] = [
  { key: 'researching', tKey: 'statusResearching', cls: 'bg-slate-500/10 text-slate-600', dot: 'bg-slate-500' },
  { key: 'applying', tKey: 'statusApplying', cls: 'bg-sky-500/10 text-sky-600', dot: 'bg-sky-500' },
  { key: 'submitted', tKey: 'statusSubmitted', cls: 'bg-[#9370DB]/10 text-[#9370DB]', dot: 'bg-[#9370DB]' },
  { key: 'accepted', tKey: 'statusAccepted', cls: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  { key: 'rejected', tKey: 'statusRejected', cls: 'bg-red-500/10 text-red-500', dot: 'bg-red-500' },
  { key: 'waitlisted', tKey: 'statusWaitlisted', cls: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
];

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

  // Application tracker
  const [applications, setApplications] = useState<any[]>([]);
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [newAppUni, setNewAppUni] = useState('');
  const [newAppStatus, setNewAppStatus] = useState('researching');
  const [newAppNotes, setNewAppNotes] = useState('');
  const [showAddApp, setShowAddApp] = useState(false);
  const [appSaving, setAppSaving] = useState(false);

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

  // Load application tracker data once we know who is logged in
  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/admin/applications?userEmail=${encodeURIComponent(user.email)}`).then((r) =>
        r.ok ? r.json() : [],
      ),
      fetch('/api/admin/universities').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([apps, unis]) => {
        if (cancelled) return;
        setApplications(Array.isArray(apps) ? apps : []);
        setAllUniversities(Array.isArray(unis) ? unis : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loadApplications = async (email: string) => {
    const apps = await fetch(`/api/admin/applications?userEmail=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    setApplications(Array.isArray(apps) ? apps : []);
  };

  const addApplication = async () => {
    if (!user?.email || !newAppUni) return;
    const uni = allUniversities.find((u) => String(u.id) === newAppUni);
    if (!uni) return;
    setAppSaving(true);
    try {
      await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          universityId: uni.id,
          universityName: uni.name,
          status: newAppStatus,
          notes: newAppNotes.trim(),
        }),
      });
      setNewAppUni('');
      setNewAppNotes('');
      setNewAppStatus('researching');
      setShowAddApp(false);
      await loadApplications(user.email);
    } catch {
      /* ignore */
    } finally {
      setAppSaving(false);
    }
  };

  const updateApp = async (app: any, patch: Partial<{ status: string; notes: string }>) => {
    try {
      await fetch(`/api/admin/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patch, userEmail: user.email }),
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
        ),
      );
    } catch {
      /* ignore */
    }
  };

  const deleteApp = async (id: number) => {
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email }),
      });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      /* ignore */
    }
  };

  const daysUntil = (app: any): number | null => {
    const uni = allUniversities.find((u) => u.id === app.universityId);
    const deadline = uni?.applicationDeadlines?.[0]?.deadline;
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  const statusInfo = (key: string) =>
    APP_STATUSES.find((s) => s.key === key) || APP_STATUSES[0];

  const handleSaveProfile = async () => {
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

    // Persist to the backend so the name/picture survives logout/login and
    // shows up on any device. The backend response is authoritative — it wins
    // over the local copy so nothing can go stale.
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: username, profilePicture }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const merged = {
            ...updatedUser,
            name: data.user.name ?? updatedUser.name,
            profilePicture: data.user.profilePicture ?? updatedUser.profilePicture,
          };
          localStorage.setItem('user', JSON.stringify(merged));
          localStorage.setItem('userProfileData', JSON.stringify({
            email: merged.email,
            name: merged.name,
            profilePicture: merged.profilePicture,
          }));
          setUser(merged);
          window.dispatchEvent(new Event('userLogin'));
        }
      }
    } catch {
      // Backend unreachable — the local copy still works until next login
    }
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
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

        {/* Divider */}
        <div className="border-b-2 border-[#A8A8C8] dark:border-dark-border my-8"></div>

        {/* Application Tracker */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-[#9370DB] dark:text-dark-violet" />
              {t('applicationTracker')}
            </h2>
            <button
              onClick={() => setShowAddApp((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('addApplication')}
            </button>
          </div>

          {/* Add form */}
          {showAddApp && (
            <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-5 mb-6 animate-fade-in-down">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1.5">
                    {t('selectUniversity')}
                  </label>
                  <select
                    value={newAppUni}
                    onChange={(e) => setNewAppUni(e.target.value)}
                    className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text text-sm"
                  >
                    <option value="">{t('selectUniversity')}</option>
                    {allUniversities.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.name} — {u.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1.5">
                    {t('status')}
                  </label>
                  <select
                    value={newAppStatus}
                    onChange={(e) => setNewAppStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text text-sm"
                  >
                    {APP_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {t(s.tKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1.5">
                  {t('notes')}
                </label>
                <textarea
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  rows={2}
                  placeholder={t('notesPlaceholder')}
                  className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text text-sm placeholder-slate-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addApplication}
                  disabled={appSaving || !newAppUni}
                  className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {appSaving ? t('sending') : t('save')}
                </button>
                <button
                  onClick={() => setShowAddApp(false)}
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          {applications.length === 0 && !showAddApp ? (
            <p className="text-slate-600 dark:text-dark-text-secondary">
              {t('noApplications')}
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const info = statusInfo(app.status);
                const days = daysUntil(app);
                return (
                  <div
                    key={app.id}
                    className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          onClick={() => router.push(`/university/${slugify(app.universityName)}`)}
                          className="font-semibold text-slate-900 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors text-left"
                        >
                          {app.universityName}
                        </button>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                          <select
                            value={app.status}
                            onChange={(e) => updateApp(app, { status: e.target.value })}
                            className={`px-2 py-1 rounded-full font-semibold border-0 cursor-pointer ${info.cls}`}
                          >
                            {APP_STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {t(s.tKey)}
                              </option>
                            ))}
                          </select>
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-dark-text-secondary">
                            <Calendar className="w-3.5 h-3.5" />
                            {days === null
                              ? t('noDeadlineSet')
                              : days < 0
                                ? t('daysOverdue', { n: String(Math.abs(days)) })
                                : t('daysLeft', { n: String(days) })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title={t('deleteApplication')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {app.notes && (
                      <textarea
                        defaultValue={app.notes}
                        onBlur={(e) => {
                          if (e.target.value !== app.notes) updateApp(app, { notes: e.target.value });
                        }}
                        rows={2}
                        className="mt-3 w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-700 dark:text-dark-text text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
