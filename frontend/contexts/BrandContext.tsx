'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getBrandSettings,
  DEFAULT_APP_NAME,
  type BrandSettings,
} from '@/utils/brand';

/** localStorage key mirroring the backend settings, so tabs share branding instantly. */
const BRAND_STORAGE_KEY = 'appBranding';

interface BrandContextType {
  appName: string;
  appIcon: string;
  refresh: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

function readCachedBrand(): BrandSettings {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.appName) {
        return { appName: parsed.appName, appIcon: parsed.appIcon || '' };
      }
    }
  } catch {
    /* ignore malformed cache */
  }
  return { appName: DEFAULT_APP_NAME, appIcon: '' };
}

/** Apply the brand to the browser tab title + favicon (mirrors the old Navbar behavior). */
function applyDocumentBranding(appName: string, appIcon: string) {
  document.title = `${appName} - Discover Universities Worldwide`;
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

export function BrandProvider({ children }: { children: ReactNode }) {
  // Start from the default so the first client render matches the server HTML
  // (avoids hydration mismatches); the cached brand is applied in the effect.
  const [brand, setBrand] = useState<BrandSettings>({
    appName: DEFAULT_APP_NAME,
    appIcon: '',
  });

  const refresh = useCallback(async () => {
    const settings = await getBrandSettings(true);
    setBrand(settings);
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota errors */
    }
    applyDocumentBranding(settings.appName, settings.appIcon);
  }, []);

  useEffect(() => {
    // Instant paint from the cached brand, then fetch fresh from the backend.
    setBrand(readCachedBrand());
    refresh();

    const onBrandingChanged = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === BRAND_STORAGE_KEY) refresh();
    };
    window.addEventListener('appBrandingChanged', onBrandingChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('appBrandingChanged', onBrandingChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return (
    <BrandContext.Provider value={{ appName: brand.appName, appIcon: brand.appIcon, refresh }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
