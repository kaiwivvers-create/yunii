'use client';

import { useEffect, useState } from 'react';
import { BarChart3, GraduationCap, Globe, Users, BookOpen, Trash2, Heart, History } from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

interface ReportData {
  totals: {
    universities: number;
    regions: number;
    users: number;
    admins: number;
    programs: number;
    trash: number;
    bookmarks: number;
    versions: number;
  };
  topSavedUniversities: { id: number; name: string; count: number }[];
  savesByRegion: { region: string; count: number }[];
  universitiesByRegion: { region: string; count: number }[];
  activityBreakdown: { action: string; count: number }[];
}

function BarList({ title, items, color }: { title: string; items: { label: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...items.map(i => i.count));
  return (
    <div className={`${cardCls} p-5`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">No data yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700 dark:text-dark-text truncate pr-2">{item.label}</span>
                <span className="font-semibold text-slate-900 dark:text-dark-text shrink-0">{item.count}</span>
              </div>
              <div className="h-2.5 bg-[#F0EEF8] dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reports({ refreshKey }: { refreshKey?: number }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  if (loading) {
    return <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>;
  }
  if (!data) return null;

  const statChips = [
    { label: 'Universities', value: data.totals.universities, icon: GraduationCap, cls: 'text-[#9370DB] bg-[#9370DB]/10' },
    { label: 'Regions', value: data.totals.regions, icon: Globe, cls: 'text-[#60A5FA] bg-[#60A5FA]/10' },
    { label: 'Users', value: data.totals.users, icon: Users, cls: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Programs', value: data.totals.programs, icon: BookOpen, cls: 'text-amber-500 bg-amber-500/10' },
    { label: 'Times Saved', value: data.totals.bookmarks, icon: Heart, cls: 'text-pink-500 bg-pink-500/10' },
    { label: 'In Trash', value: data.totals.trash, icon: Trash2, cls: 'text-red-500 bg-red-500/10' },
    { label: 'Versions', value: data.totals.versions, icon: History, cls: 'text-cyan-500 bg-cyan-500/10' },
  ];

  const activityLabels: Record<string, string> = {
    created: 'Created',
    edited: 'Edited',
    deleted: 'Deleted',
    reverted: 'Reverted',
    imported: 'Imported',
    permanently_deleted: 'Deleted forever',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Reports</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            What students engage with most, straight from live bookmark data
          </p>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statChips.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`${cardCls} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900 dark:text-dark-text leading-none">{value}</div>
              <div className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1 whitespace-nowrap">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <BarList
          title="Most Saved Universities"
          items={data.topSavedUniversities.map(u => ({ label: u.name, count: u.count }))}
          color="bg-[#9370DB]"
        />
        <BarList
          title="Saves by Region"
          items={data.savesByRegion.map(r => ({ label: r.region, count: r.count }))}
          color="bg-pink-400"
        />
        <BarList
          title="Universities by Region"
          items={data.universitiesByRegion.map(r => ({ label: r.region, count: r.count }))}
          color="bg-[#60A5FA]"
        />
        <BarList
          title="Admin Activity"
          items={data.activityBreakdown.map(a => ({ label: activityLabels[a.action] || a.action, count: a.count }))}
          color="bg-emerald-400"
        />
      </div>
    </div>
  );
}
