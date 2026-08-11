'use client';

import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { History, RotateCcw, GraduationCap, ChevronDown } from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

interface VersionEntry {
  version: number;
  snapshot: any;
  timestamp: string;
  actor: string;
  summary: string;
}

interface VersionGroup {
  universityId: number;
  universityName: string;
  versions: VersionEntry[];
}

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function VersionHistory({ refreshKey }: { refreshKey?: number }) {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<VersionGroup[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{
    uniId: number;
    version: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/versions');
        if (res.ok) {
          const data = await res.json();
          setGroups(data || []);
          if (data?.length && selected === null) setSelected(data[0].universityId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const doRevert = async () => {
    if (!confirm) return;
    try {
      const res = await fetch(`/api/admin/universities/${confirm.uniId}/revert/${confirm.version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: user?.name || 'admin', actorRole: user?.role || '' }),
      });
      if (res.ok) {
        setConfirm(null);
        const reload = async () => {
          const r = await fetch('/api/admin/versions');
          if (r.ok) setGroups(await r.json());
        };
        reload();
      }
    } catch (err) {
      console.error(err);
      setConfirm(null);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>;
  }

  const current = groups.find(g => g.universityId === selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Version History</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            Every save is a version — jump back to any point in time
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* University picker */}
        <div className={`${cardCls} p-4 max-h-[70vh] overflow-y-auto`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-3 px-1">Universities</h3>
          <div className="space-y-1.5">
            {groups.map((g) => (
              <button
                key={g.universityId}
                onClick={() => setSelected(g.universityId)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  selected === g.universityId
                    ? 'bg-[#9370DB]/10 border border-[#9370DB]/40 text-[#9370DB] dark:text-dark-violet'
                    : 'hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text border border-transparent'
                }`}
              >
                <div className="font-medium text-sm truncate">{g.universityName}</div>
                <div className="text-xs text-slate-500 dark:text-dark-text-secondary">
                  {g.versions.length} version{g.versions.length === 1 ? '' : 's'}
                </div>
              </button>
            ))}
            {groups.length === 0 && (
              <div className="p-6 text-center text-slate-500 dark:text-dark-text-secondary text-sm">
                No versions yet
              </div>
            )}
          </div>
        </div>

        {/* Version list */}
        <div className={`${cardCls} overflow-hidden`}>
          {current ? (
            <>
              <div className="px-5 py-3.5 border-b border-[#F0EEF8] dark:border-dark-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-dark-text">{current.universityName}</div>
                  <div className="text-xs text-slate-500 dark:text-dark-text-secondary">
                    {current.versions.length} saved version{current.versions.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-[#F0EEF8] dark:divide-dark-border max-h-[55vh] overflow-y-auto">
                {[...current.versions].reverse().map((v) => {
                  const isExpanded = expanded === v.version;
                  const isLatest = v.version === current.versions[current.versions.length - 1].version;
                  return (
                    <div key={v.version} className="hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : v.version)}
                        className="w-full flex items-center gap-4 p-4 text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0 font-bold text-sm">
                          v{v.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-dark-text truncate">
                            {v.summary || 'Saved'}
                            {isLatest && (
                              <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                                current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-dark-text-secondary">
                            {formatTime(v.timestamp)} · {v.actor}
                          </div>
                        </div>
                        {!isLatest && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirm({ uniId: current.universityId, version: v.version, name: current.universityName });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-lg text-sm font-medium hover:bg-[#9370DB] hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Revert
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4">
                          <div className="bg-[#F4F2FA] dark:bg-dark-bg-tertiary rounded-lg p-4 text-sm text-slate-700 dark:text-dark-text space-y-1.5">
                            <div><span className="text-slate-500 dark:text-dark-text-secondary font-medium">Name:</span> {v.snapshot.name}</div>
                            <div><span className="text-slate-500 dark:text-dark-text-secondary font-medium">Location:</span> {v.snapshot.location}</div>
                            <div><span className="text-slate-500 dark:text-dark-text-secondary font-medium">Region:</span> {v.snapshot.region}</div>
                            <div><span className="text-slate-500 dark:text-dark-text-secondary font-medium">Description:</span> {v.snapshot.description}</div>
                            {v.snapshot.details?.overview && (
                              <div><span className="text-slate-500 dark:text-dark-text-secondary font-medium">Overview:</span> {v.snapshot.details.overview}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-500 dark:text-dark-text-secondary">
              Select a university to see its versions
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title="Revert to this version?"
        message={`Restore "${confirm?.name}" to version v${confirm?.version}? Any newer changes will be kept as a new version so you can go back.`}
        confirmLabel="Revert"
        onConfirm={doRevert}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
