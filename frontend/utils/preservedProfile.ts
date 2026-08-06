interface PreservedProfile {
  email?: string;
  name?: string;
  profilePicture?: string;
}

/**
 * Reads the user's saved profile (custom name/picture edited on the profile page)
 * and returns it only when it clearly belongs to the given account:
 * - the data is keyed by the same email, OR
 * - it's legacy data (no email) whose name matches the account's name and isn't
 *   the generic 'User' fallback, so it can't leak onto other accounts.
 *
 * Legacy data is migrated to be keyed by the account's email, so it can never
 * leak onto a different account in future logins.
 */
export function getPreservedProfileFor(user: { email?: string; name?: string }): PreservedProfile | null {
  try {
    const stored = localStorage.getItem('userProfileData');
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PreservedProfile;

    // The demo admin identity ('Kai') must never follow another account, even if
    // mislabeled data carries that account's email. Relabel it back to Kai's email
    // so it's ready for Kai's next login instead.
    if (parsed.name === 'Kai' && user.email !== 'kai@example.com') {
      localStorage.setItem('userProfileData', JSON.stringify({ ...parsed, email: 'kai@example.com' }));
      return null;
    }

    const belongsToAccount =
      parsed.email === user.email ||
      (!!parsed.name && parsed.name === user.name && parsed.name !== 'User');

    if (!belongsToAccount) return null;

    // Migrate legacy / mislabeled data to this account's email
    if (parsed.email !== user.email) {
      localStorage.setItem('userProfileData', JSON.stringify({ ...parsed, email: user.email }));
    }

    return parsed;
  } catch {
    return null;
  }
}
