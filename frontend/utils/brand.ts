/**
 * Shared branding helpers.
 *
 * The app's display name & icon live in the backend settings row
 * (GET /admin/settings -> SettingsEntity) and are cached here so every
 * component, server route and metadata block reads from one source of truth.
 *
 * The literal brand name is never hardcoded in UI strings: text templates use
 * the {appName} placeholder, which is substituted with the configured name
 * (defaulting to "UniVerse").
 */

export const DEFAULT_APP_NAME = 'UniVerse';
export const BRAND_PLACEHOLDER = '{appName}';

export interface BrandSettings {
  appName: string;
  appIcon: string;
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://98.142.245.188:7777';

// Small server-side cache so metadata/AI routes don't hit the backend on
// every request (the client BrandProvider always fetches fresh).
let cached: { settings: BrandSettings; at: number } | null = null;
const CACHE_TTL_MS = 60_000;

/** Substitute {appName} placeholders in a string with the configured brand name. */
export function subBrand(text: string, appName: string): string {
  return text.split(BRAND_PLACEHOLDER).join(appName || DEFAULT_APP_NAME);
}

/**
 * Load the configured app branding, falling back to defaults when the backend
 * is unreachable. On the client the relative /api/admin/settings path is used
 * (proxied by the Next rewrite); on the server the backend is called directly.
 */
export async function getBrandSettings(force = false): Promise<BrandSettings> {
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.settings;
  }

  const fallback: BrandSettings = { appName: DEFAULT_APP_NAME, appIcon: '' };
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer ? `${BACKEND_URL}/admin/settings` : '/api/admin/settings';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('Failed to load app settings');
    const data = await res.json();
    const settings: BrandSettings = {
      appName: data.appName || DEFAULT_APP_NAME,
      appIcon: data.appIcon || '',
    };
    cached = { settings, at: Date.now() };
    return settings;
  } catch {
    cached = { settings: fallback, at: Date.now() };
    return fallback;
  }
}
