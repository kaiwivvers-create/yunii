'use client';

import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import {
  ScrollText,
  RotateCcw,
  XCircle,
  GraduationCap,
  Globe,
  UserCircle2,
  Settings,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

const actionStyles: Record<string, { label: string; dot: string; pill: string }> = {
  created: { label: 'Created', dot: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  edited: { label: 'Edited', dot: 'bg-blue-500', pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  deleted: { label: 'Deleted', dot: 'bg-red-500', pill: 'bg-red-500/10 text-red-500' },
  reverted: { label: 'Reverted', dot: 'bg-[#9370DB]', pill: 'bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet' },
  permanently_deleted: { label: 'Deleted forever', dot: 'bg-red-700', pill: 'bg-red-700/10 text-red-700 dark:text-red-400' },
  imported: { label: 'Imported', dot: 'bg-amber-500', pill: 'bg-amber-500/10 text-amber-600' },
};

const entityIcons: Record<string, any> = {
  university: GraduationCap,
  region: Globe,
  user: UserCircle2,
  settings: Settings,
  role: ShieldCheck,
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

interface LogEntry {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  entityName: string;
  actor: string;
  timestamp: string;
  meta?: any;
}

interface TrashItem {
  id: number;
  type: 'university' | 'user';
  item: any;
  deletedAt: string;
  deletedBy: string;
}

export default function ActivityLog({ refreshKey }: { refreshKey?: number }) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    action: () => void;
  } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/activity');
      if (res.ok) {
        const data = await res.json();
        setLog(data.log || []);
        setTrash(data.trash || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const restoreTrash = async (trashId: number) => {
    try {
      const res = await fetch(`/api/admin/trash/${trashId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'admin' }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteForever = async (trashId: number) => {
    try {
      const res = await fetch(`/api/admin/trash/${trashId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'admin' }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const revertEdit = async (entry: LogEntry) => {
    const version = entry.meta?.version;
    if (!version || version <= 1) return;
    try {
      const res = await fetch(`/api/admin/universities/${entry.entityId}/revert/${version - 1}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'admin' }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Whether a revert action is available for this log entry
  const canRevert = (entry: LogEntry) =>
    (entry.action === 'deleted' && !!entry.meta?.trashId) ||
    (entry.action === 'edited' && (entry.meta?.version ?? 0) > 1);

  const revertTooltip = (entry: LogEntry) => {
    if (entry.action === 'edited') return 'No earlier version to revert to';
    return 'Nothing to revert';
  };

  const handleRevert = (entry: LogEntry) => {
    if (!canRevert(entry)) return;
    if (entry.action === 'deleted') {
      setConfirm({
        title: 'Revert deletion',
        message: `Restore "${entry.entityName}" back to your content?`,
        danger: false,
        action: () => restoreTrash(entry.meta?.trashId),
      });
    } else {
      setConfirm({
        title: 'Revert edit',
        message: `Undo the last edit to "${entry.entityName}"? This restores the previous version.`,
        danger: false,
        action: () => revertEdit(entry),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <ScrollText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Activity Log</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            Everything admins have created, edited, deleted, or reverted
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>
      ) : (
        <>
          {/* Recently deleted */}
          {trash.length > 0 && (
            <div className={`${cardCls} overflow-hidden`}>
              <div className="px-5 py-3.5 border-b border-[#F0EEF8] dark:border-dark-border flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-slate-900 dark:text-dark-text">
                  Recently Deleted ({trash.length})
                </span>
                <span className="text-xs text-slate-500 dark:text-dark-text-secondary">
                  — recoverable until permanently deleted
                </span>
              </div>
              <div className="divide-y divide-[#F0EEF8] dark:divide-dark-border">
                {trash.map((item) => {
                  const Icon = entityIcons[item.type] || GraduationCap;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-dark-text truncate">
                          {item.item.name || item.item.email || 'Untitled'}
                          <span className="text-xs text-slate-500 dark:text-dark-text-secondary ml-2 capitalize">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-dark-text-secondary">
                          Deleted {formatTime(item.deletedAt)} by {item.deletedBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setConfirm({
                              title: 'Revert deletion',
                              message: `Restore "${item.item.name || item.item.email}" back to your content?`,
                              danger: false,
                              action: () => restoreTrash(item.id),
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-lg text-sm font-medium hover:bg-[#9370DB] hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Revert
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              title: 'Delete permanently',
                              message: `Permanently delete "${item.item.name || item.item.email}"? This cannot be undone.`,
                              danger: true,
                              action: () => deleteForever(item.id),
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Delete forever
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Log entries */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-5 py-3.5 border-b border-[#F0EEF8] dark:border-dark-border font-semibold text-slate-900 dark:text-dark-text">
              Recent Activity ({log.length})
            </div>
            <div className="divide-y divide-[#F0EEF8] dark:divide-dark-border max-h-[60vh] overflow-y-auto">
              {log.map((entry) => {
                const style = actionStyles[entry.action] || {
                  label: entry.action,
                  dot: 'bg-slate-400',
                  pill: 'bg-slate-500/10 text-slate-600',
                };
                const Icon = entityIcons[entry.entity] || GraduationCap;
                const revertible = canRevert(entry);
                return (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 dark:text-dark-text truncate">
                        <span className="font-medium">{entry.actor}</span>{' '}
                        <span className="text-slate-500 dark:text-dark-text-secondary">
                          {style.label.toLowerCase()}{' '}
                          <span className="capitalize">{entry.entity}</span>
                        </span>{' '}
                        “{entry.entityName}”
                        {entry.action === 'edited' && entry.meta?.version ? (
                          <span className="text-slate-400 dark:text-dark-text-secondary"> (v{entry.meta.version})</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-dark-text-secondary mt-0.5">{formatTime(entry.timestamp)}</div>
                    </div>
                    <span
                      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${style.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRevert(entry)}
                        disabled={!revertible}
                        title={revertible ? 'Revert' : revertTooltip(entry)}
                        className={`p-2 rounded-lg transition-colors ${
                          revertible
                            ? 'text-[#9370DB] dark:text-dark-violet hover:bg-[#9370DB]/10'
                            : 'text-slate-300 dark:text-dark-bg-tertiary cursor-not-allowed'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      {entry.action === 'deleted' && entry.meta?.trashId && (
                        <button
                          onClick={() =>
                            setConfirm({
                              title: 'Delete permanently',
                              message: `Permanently delete "${entry.entityName}"? This cannot be undone.`,
                              danger: true,
                              action: () => deleteForever(entry.meta.trashId),
                            })
                          }
                          title="Delete forever"
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {log.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-dark-text-secondary">No activity yet</div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        danger={confirm?.danger}
        confirmLabel={confirm?.danger ? 'Delete forever' : 'Revert'}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
