'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Guide, GuideSection } from '../data/guides';
import { loadGuides, saveGuide, deleteGuide } from '../utils/guidesStore';

const CATEGORIES: Guide['category'][] = [
  'Admissions',
  'Costs',
  'Visas',
  'Scholarships',
  'Deadlines',
  'Country Guides',
];

interface SectionForm {
  heading: string;
  body: string;
  listText: string;
}

interface GuideEditorProps {
  open: boolean;
  initialGuide: Guide | null; // null => creating a brand new guide
  onClose: () => void;
  onSaved: (guide: Guide) => void;
  onDeleted?: (slug: string) => void;
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptySection = (): SectionForm => ({ heading: '', body: '', listText: '' });

export default function GuideEditor({ open, initialGuide, onClose, onSaved, onDeleted }: GuideEditorProps) {
  const isNew = !initialGuide;
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [category, setCategory] = useState<Guide['category']>('Admissions');
  const [readTime, setReadTime] = useState(5);
  const [excerpt, setExcerpt] = useState('');
  const [excerptZh, setExcerptZh] = useState('');
  const [image, setImage] = useState('');
  const [sections, setSections] = useState<SectionForm[]>([emptySection()]);

  useEffect(() => {
    if (!open) return;
    setSlugTouched(false);
    if (initialGuide) {
      setSlug(initialGuide.slug);
      setTitle(initialGuide.title);
      setTitleZh(initialGuide.titleZh || '');
      setCategory(initialGuide.category);
      setReadTime(initialGuide.readTime || 5);
      setExcerpt(initialGuide.excerpt || '');
      setExcerptZh(initialGuide.excerptZh || '');
      setImage(initialGuide.image || '');
      setSections(
        initialGuide.sections?.length
          ? initialGuide.sections.map((s) => ({
              heading: s.heading || '',
              body: s.body || '',
              listText: (s.list || []).join('\n'),
            }))
          : [emptySection()]
      );
    } else {
      setSlug('');
      setTitle('');
      setTitleZh('');
      setCategory('Admissions');
      setReadTime(5);
      setExcerpt('');
      setExcerptZh('');
      setImage('');
      setSections([emptySection()]);
    }
  }, [open, initialGuide]);

  if (!open) return null;

  const updateSection = (index: number, patch: Partial<SectionForm>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for the guide.');
      return;
    }

    let finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) {
      alert('Please enter a title or slug.');
      return;
    }

    // Ensure new slugs are unique
    if (isNew) {
      const existing = new Set(loadGuides().map((g) => g.slug));
      let candidate = finalSlug;
      let i = 2;
      while (existing.has(candidate)) {
        candidate = `${finalSlug}-${i}`;
        i += 1;
      }
      finalSlug = candidate;
    }

    const guide: Guide = {
      slug: finalSlug,
      title: title.trim(),
      titleZh: titleZh.trim() || title.trim(),
      category,
      readTime: Number(readTime) || 5,
      excerpt: excerpt.trim(),
      excerptZh: excerptZh.trim() || excerpt.trim(),
      image: image.trim(),
      sections: sections
        .map(
          (s): GuideSection => ({
            heading: s.heading.trim(),
            body: s.body.trim() || undefined,
            list: s.listText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean),
          })
        )
        .filter((s) => s.heading || s.body || (s.list && s.list.length > 0)),
    };

    saveGuide(guide);
    onSaved(guide);
    onClose();
  };

  const handleDelete = () => {
    if (!initialGuide) return;
    if (window.confirm(`Delete "${initialGuide.title}"? This cannot be undone.`)) {
      deleteGuide(initialGuide.slug);
      onDeleted?.(initialGuide.slug);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#A8A8C8] dark:border-dark-border shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">
            {isNew ? 'New Guide' : 'Edit Guide'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-dark-text hover:bg-[#A8A8C8]/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  // Auto-fill the slug from the title while creating (until the user edits it manually)
                  if (isNew && !slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. How to Write a Personal Statement"
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Title (中文)</label>
              <input
                type="text"
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text focus:outline-none focus:border-[#9370DB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                disabled={!isNew}
                placeholder={slugify(title) || 'auto-generated from title'}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {!isNew && <p className="text-xs text-slate-500 mt-1">Slug is fixed once created.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Guide['category'])}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text focus:outline-none focus:border-[#9370DB]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Read time (minutes)</label>
              <input
                type="number"
                min={1}
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text focus:outline-none focus:border-[#9370DB]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Excerpt (中文)</label>
              <textarea
                value={excerptZh}
                onChange={(e) => setExcerptZh(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-dark-text mb-1.5">Cover image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
              />
              {image && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-800 dark:text-dark-text">Sections</label>
              <button
                onClick={() => setSections((prev) => [...prev, emptySection()])}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] hover:bg-[#9370DB]/20 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add section
              </button>
            </div>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="border border-[#A8A8C8] dark:border-dark-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Section {index + 1}
                    </span>
                    <button
                      onClick={() => setSections((prev) => prev.filter((_, i) => i !== index))}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => updateSection(index, { heading: e.target.value })}
                    placeholder="Heading"
                    className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB]"
                  />
                  <textarea
                    value={section.body}
                    onChange={(e) => updateSection(index, { body: e.target.value })}
                    rows={3}
                    placeholder="Body paragraph (optional)"
                    className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
                  />
                  <textarea
                    value={section.listText}
                    onChange={(e) => updateSection(index, { listText: e.target.value })}
                    rows={3}
                    placeholder={'List items — one per line (optional)'}
                    className="w-full px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-dark-text placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#A8A8C8] dark:border-dark-border shrink-0">
          {isNew ? (
            <span />
          ) : (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete guide
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#A8A8C8] dark:border-dark-border text-slate-800 dark:text-dark-text rounded-lg text-sm font-medium hover:bg-[#A8A8C8]/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9370DB] text-white rounded-lg text-sm font-semibold hover:bg-[#7B68EE] transition-colors"
            >
              <Save className="w-4 h-4" /> Save guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
