'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, GraduationCap, CheckCircle2, Upload, X } from 'lucide-react';

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

const CROP_SIZE = 280;
const OUT_SIZE = 256;

export default function SettingsSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [appName, setAppName] = useState('UniVerse');
  const [appIcon, setAppIcon] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Crop state
  const [crop, setCrop] = useState<null | { src: string; zoom: number; img: HTMLImageElement }>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setAppName(data.appName || 'UniVerse');
          setAppIcon(data.appIcon || '');
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
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setCrop({ src: url, zoom: 1, img });
    };
    img.src = url;
  };

  const applyCrop = () => {
    if (!crop) return;
    const { img, zoom } = crop;
    const dw = CROP_SIZE * zoom; // display width of the img
    const scale = img.naturalWidth / dw;
    const sw = CROP_SIZE * scale;
    const sh = CROP_SIZE * scale;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_SIZE;
    canvas.height = OUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_SIZE, OUT_SIZE);
    setAppIcon(canvas.toDataURL('image/png'));
    URL.revokeObjectURL(crop.src);
    setCrop(null);
    setFlash('Icon cropped — hit Save Settings to apply it');
  };

  const handleSave = async () => {
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, appIcon }),
      });
      if (res.ok) {
        const data = await res.json();
        applyAppBranding(data.appName, data.appIcon);
        setAppName(data.appName);
        setAppIcon(data.appIcon);
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
      {crop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`${cardCls} p-6 max-w-md w-full animate-scale-in`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">Crop Icon</h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(crop.src);
                  setCrop(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              {/* Crop area */}
              <div
                className="rounded-2xl overflow-hidden border-4 border-[#9370DB] shadow-lg relative bg-[#F4F2FA]"
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
              >
                <img
                  src={crop.src}
                  alt="Crop"
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: CROP_SIZE * crop.zoom,
                    transform: 'translate(-50%, -50%)',
                    maxWidth: 'none',
                  }}
                />
              </div>

              {/* Preview */}
              <div className="text-center">
                <div
                  className="rounded-xl overflow-hidden mx-auto mb-2"
                  style={{ width: 72, height: 72 }}
                >
                  <div style={{ width: 72 * crop.zoom, transform: 'scale(1)', position: 'relative' }}>
                    <img
                      src={crop.src}
                      alt="Preview"
                      className="max-w-none"
                      style={{
                        width: 72 * crop.zoom,
                        transform: 'translateX(-50%)',
                        marginLeft: '50%',
                        marginTop: -((72 * crop.zoom - 72) / 2),
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary">Preview</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-text-secondary">Zoom</span>
                <span className="text-slate-900 dark:text-dark-text font-medium">{crop.zoom.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={0.1}
                value={crop.zoom}
                onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })}
                className="w-full accent-[#9370DB]"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#F0EEF8] dark:border-dark-border">
              <button
                onClick={() => {
                  URL.revokeObjectURL(crop.src);
                  setCrop(null);
                }}
                className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
