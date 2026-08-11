'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, GraduationCap, CheckCircle2, Upload, X } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

const inputCls =
  'w-full px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20 transition-all';

export function applyAppBranding(appName: string, appIcon: string) {
  document.title = appName ? `${appName} - Discover Universities Worldwide` : 'UniVerse - Discover Universities Worldwide';
  if (appIcon) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = appIcon;
  }
}


export default function SettingsSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [appName, setAppName] = useState('UniVerse');
  const [appIcon, setAppIcon] = useState('');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Crop state (source image data URL / object URL while the cropper is open)
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setAppName(data.appName || 'UniVerse');
          setAppIcon(data.appIcon || '');
          setAddress(data.address || '');
          setManagerName(data.managerName || '');
          setContactEmail(data.contactEmail || '');
          setContactPhone(data.contactPhone || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFile = (file: File) => {
    setCropSrc(URL.createObjectURL(file));
  };

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          appIcon,
          address,
          managerName,
          contactEmail,
          contactPhone,
          actor: user?.name || 'admin',
          actorRole: user?.role || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        applyAppBranding(data.appName, data.appIcon);
        setAppName(data.appName);
        setAppIcon(data.appIcon);
        // Persist + notify every tab/component so the new brand applies instantly.
        try {
          localStorage.setItem(
            'appBranding',
            JSON.stringify({ appName: data.appName, appIcon: data.appIcon }),
          );
        } catch {
          /* ignore quota errors */
        }
        window.dispatchEvent(new Event('appBrandingChanged'));
        setFlash('App name & icon saved — check your browser tab!');
      } else {
        setFlash('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      setFlash('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">App Settings</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            Change the app name and icon shown in the browser tab and navbar
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className={`${cardCls} p-6 space-y-5`}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
              App Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. UniVerse"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
              App Icon
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
              >
                <Upload className="w-4 h-4" />
                Upload & Crop
              </button>
              {appIcon && (
                <button
                  onClick={() => setAppIcon('')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1.5">
              Upload any image — you'll crop it to a square before saving.
            </p>
          </div>
          <div className="pt-2 border-t border-[#F0EEF8] dark:border-dark-border space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">
              Company Info
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 University Ave, Jakarta"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Manager / Owner
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Kai Han"
                className={inputCls}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@universe.app"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            {flash && (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {flash}
              </span>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className={`${cardCls} p-6 flex flex-col items-center justify-center text-center`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary mb-4">
            Live preview
          </p>
          <div className="w-20 h-20 rounded-2xl bg-[#9370DB]/10 flex items-center justify-center mb-4 overflow-hidden">
            {appIcon ? (
              <img src={appIcon} alt="App icon" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-10 h-10 text-[#9370DB]" />
            )}
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-dark-text">{appName || 'App Name'}</div>
          <div className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">
            {appName || 'App Name'} - Discover Universities Worldwide
          </div>
        </div>
      </div>

      {/* Crop modal */}
      <ImageCropper
        open={!!cropSrc}
        imageSrc={cropSrc || ''}
        title="Crop App Icon"
        size={280}
        outputSize={256}
        onCancel={closeCropper}
        onConfirm={(dataUrl) => {
          setAppIcon(dataUrl);
          closeCropper();
          setFlash('Icon cropped — hit Save Settings to apply it');
        }}
      />
    </div>
  );
}
