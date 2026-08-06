import { guides as staticGuides } from '../data/guides';
import type { Guide } from '../data/guides';

const STORAGE_KEY = 'customGuides';

type CustomGuideMap = Record<string, Guide>;

function getCustomGuides(): CustomGuideMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CustomGuideMap) : {};
  } catch {
    return {};
  }
}

/**
 * Merged guide list: the static guides with any admin edits overlaid by slug,
 * and any admin-created guides appended. Falls back to static guides when the
 * browser has no customizations.
 */
export function loadGuides(): Guide[] {
  const custom = getCustomGuides();
  if (Object.keys(custom).length === 0) return staticGuides;

  const bySlug = new Map<string, Guide>(staticGuides.map((g) => [g.slug, g]));
  for (const [slug, guide] of Object.entries(custom)) bySlug.set(slug, guide);
  return Array.from(bySlug.values());
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return loadGuides().find((g) => g.slug === slug);
}

export function saveGuide(guide: Guide) {
  const custom = getCustomGuides();
  custom[guide.slug] = guide;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

export function deleteGuide(slug: string) {
  const custom = getCustomGuides();
  delete custom[slug];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}
