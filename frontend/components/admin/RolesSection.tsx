'use client';

import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { UserCog, Plus, Pencil, Trash2, X, Users, ShieldCheck, Lock } from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

const inputCls =
  'w-full px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20 transition-all';

const permLabels: Record<string, string> = {
  manage_content: 'Manage content',
  manage_users: 'Manage users',
  manage_settings: 'Manage settings',
  view_reports: 'View reports',
  manage_system: 'Manage system',
};

interface RoleRow {
  id: number;
  name: string;
  permissions: string[];
  isSystem?: boolean;
  userCount: number;
}

export default function RolesSection({ refreshKey }: { refreshKey?: number }) {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [all, setAll] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState(false);
  const [modal, setModal] = useState<null | { role: RoleRow | null; name: string; permissions: string[] }>(null);
  const [confirm, setConfirm] = useState<null | { role: RoleRow; action: () => void }>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
      const p = await fetch('/api/admin/permissions');
      if (p.ok) {
        const pd = await p.json();
        setAll(pd.all || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const saveRole = async () => {
    if (!modal) return;
    if (!modal.name.trim()) {
      setFlash('Role name cannot be empty');
      setFlashError(true);
      return;
    }
    const isEdit = !!modal.role;
    try {
      const res = await fetch(isEdit ? `/api/admin/roles/${modal.role!.id}` : '/api/admin/roles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modal.name, permissions: modal.permissions }),
      });
      if (res.ok) {
        setFlash(isEdit ? 'Role updated' : 'Role created');
        setFlashError(false);
        setModal(null);
        load();
      } else {
        const text = await res.text();
        setFlash(text.includes('already exists') ? 'A role with that name already exists' : 'Failed to save role');
        setFlashError(true);
      }
    } catch (err) {
      console.error(err);
      setFlash('Failed to save role');
      setFlashError(true);
    }
  };

  const deleteRole = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFlash('Role deleted');
        setFlashError(false);
        load();
      } else {
        const text = await res.text();
        setFlash(text.includes('in use') ? text : 'Failed to delete role');
        setFlashError(true);
      }
    } catch (err) {
      console.error(err);
      setFlash('Failed to delete role');
      setFlashError(true);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Roles</h2>
            <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
              Define roles, see how many users have each, and control their permissions
            </p>
          </div>
        </div>
        <button
          onClick={() => setModal({ role: null, name: '', permissions: [] })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {flash && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            flashError ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {flash}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className={`${cardCls} p-5 flex flex-col`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                  {role.isSystem ? <Lock className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-dark-text capitalize truncate">{role.name}</div>
                  <div className="text-xs text-slate-500 dark:text-dark-text-secondary flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {role.userCount} user{role.userCount === 1 ? '' : 's'}
                    {role.isSystem && <span className="ml-1 text-[#9370DB]">· system</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setModal({ role, name: role.name, permissions: [...role.permissions] })}
                  className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                  title="Edit role"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() =>
                      setConfirm({
                        role,
                        action: () => deleteRole(role.id),
                      })
                    }
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {role.permissions.length === 0 && (
                <span className="text-xs text-slate-400 dark:text-dark-text-secondary">No permissions</span>
              )}
              {role.permissions.map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium"
                >
                  {permLabels[p] || p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`${cardCls} p-6 max-w-md w-full animate-scale-in`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                {modal.role ? 'Edit Role' : 'New Role'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">
                  Role Name
                </label>
                <input
                  type="text"
                  value={modal.name}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  placeholder="e.g. Editor"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {all.map((p) => {
                    const checked = modal.permissions.includes(p);
                    return (
                      <label
                        key={p}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                          checked
                            ? 'bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet border-[#9370DB]/40'
                            : 'bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-500 dark:text-dark-text-secondary border-transparent hover:border-[#E2E0F0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-[#9370DB]"
                          checked={checked}
                          onChange={() =>
                            setModal({
                              ...modal,
                              permissions: checked ? modal.permissions.filter(x => x !== p) : [...modal.permissions, p],
                            })
                          }
                        />
                        {permLabels[p] || p}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[#F0EEF8] dark:border-dark-border">
                <button
                  onClick={() => setModal(null)}
                  className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRole}
                  className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
                >
                  {modal.role ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="Delete role?"
        message={`Delete the "${confirm?.role.name}" role? Users assigned to it must be moved to another role first.`}
        danger
        confirmLabel="Delete role"
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
