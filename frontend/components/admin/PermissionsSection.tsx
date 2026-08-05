'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Users } from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

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

export default function PermissionsSection() {
  const [all, setAll] = useState<string[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/permissions');
        if (res.ok) {
          const data = await res.json();
          setAll(data.all || []);
          setRoles(data.roles || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = async (roleId: number, perm: string) => {
    setSaving(roleId);
    setFlash(null);
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const next = role.permissions.includes(perm)
      ? role.permissions.filter(p => p !== perm)
      : [...role.permissions, perm];
    setRoles(roles.map(r => (r.id === roleId ? { ...r, permissions: next } : r)));
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRoles(roles.map(r => (r.id === roleId ? { ...r, permissions: updated.permissions } : r)));
        setFlash(`Saved permissions for "${updated.name}"`);
      } else {
        setFlash('Failed to save permissions');
      }
    } catch (err) {
      console.error(err);
      setFlash('Failed to save permissions');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 dark:text-dark-text-secondary">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Permissions</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            Permissions are set per role — toggle what each role can do
          </p>
        </div>
      </div>

      {flash && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          {flash}
        </div>
      )}

      <div className={`${cardCls} overflow-x-auto`}>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0EEF8] dark:border-dark-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">
                Role
              </th>
              {all.map((p) => (
                <th
                  key={p}
                  className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary"
                >
                  {permLabels[p] || p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEF8] dark:divide-dark-border">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                      {role.isSystem ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-dark-text capitalize">{role.name}</div>
                      <div className="text-xs text-slate-500 dark:text-dark-text-secondary flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {role.userCount} user{role.userCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                </td>
                {all.map((p) => {
                  const checked = role.permissions.includes(p);
                  return (
                    <td key={p} className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#9370DB] cursor-pointer"
                        checked={checked}
                        disabled={saving === role.id}
                        onChange={() => toggle(role.id, p)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={all.length + 1} className="p-12 text-center text-slate-500 dark:text-dark-text-secondary">
                  No roles yet — create one in the Roles section
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
        Create, rename, or delete roles in the <span className="font-medium text-[#9370DB]">Roles</span> section — then
        assign users to roles from the Users page.
      </p>
    </div>
  );
}
