/**
 * Per-user localStorage helpers.
 *
 * Account-scoped data (compare lists, saved universities, chat history,
 * preferences, …) is stored under a key that includes the user's email so it
 * never leaks across accounts on the same browser.
 *
 * Legacy plain keys (shared by everyone) are migrated to the first account
 * that loads them and then removed, so the old shared data can't leak again.
 */

interface StoredUser {
  email?: string;
}

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function currentUserEmail(): string | null {
  return getStoredUser()?.email || null;
}

/** The per-user storage key for a base key, or null when no user is logged in. */
export function userStorageKey(base: string): string | null {
  const email = currentUserEmail();
  if (!email) return null;
  return `${base}:${email}`;
}

/** Load a value stored under the current user's key (with one-time legacy migration). */
export function loadUserData<T>(base: string, fallback: T): T {
  const key = userStorageKey(base);
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw) as T;

    // One-time migration from the legacy shared key. Parse then re-stringify so
    // the stored form always matches what saveUserData writes (legacy keys like
    // 'surveyCompleted' were stored as raw strings, not JSON).
    const legacy = localStorage.getItem(base);
    if (legacy !== null) {
      const parsed = JSON.parse(legacy) as T;
      localStorage.setItem(key, JSON.stringify(parsed));
      localStorage.removeItem(base);
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Save a value under the current user's key (no-op when logged out). */
export function saveUserData(base: string, value: unknown): void {
  const key = userStorageKey(base);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors (e.g. oversized profile pictures)
  }
}

/** Remove the current user's value for a base key. */
export function removeUserData(base: string): void {
  const key = userStorageKey(base);
  if (key) localStorage.removeItem(key);
}
