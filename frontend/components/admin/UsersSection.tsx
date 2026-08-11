'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../ConfirmModal';
import { Search, Trash2, Users, ShieldCheck, UserCircle2, CalendarDays, Pencil, X, Plus } from 'lucide-react';
import { roleLabel } from '@/utils/roles';

const inputCls =
  'w-full px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20 transition-all';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

const avatarColors = [
  'bg-[#9370DB]',
  'bg-[#60A5FA]',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
];

interface UsersSectionProps {
  /** Logged-in admin user (permission checks already done by the dashboard). */
  user: any;
  /** Called after user changes so the dashboard overview stats stay fresh. */
  onDataChange?: () => void;
}

export default function UsersSection({ user, onDataChange }: UsersSectionProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [roles, setRoles] = useState<string[]>(['user', 'admin']);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    action: () => void;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles((data.roles || []).map((r: any) => r.name));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const requestDeleteUser = (u: any) => {
    if (u.role === 'super_admin' && user?.role !== 'super_admin') return;
    setConfirmState({
      title: 'Delete user',
      message: `Delete "${u.name || u.email}"? They go to the trash and can be reverted from the Activity Log.`,
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`/api/admin/users/${u.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor: user?.name || 'admin', actorRole: user?.role || '' }),
          });
          if (res.ok) {
            setUsers(users.filter(x => x.id !== u.id));
            onDataChange?.();
          }
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert('Name and email are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, actor: user?.name || 'admin', actorRole: user?.role || '' }),
      });
      if (res.ok) {
        const created = await res.json();
        setUsers([...users, created]);
        setShowAddUser(false);
        onDataChange?.();
      } else {
        const text = await res.text();
        alert(text.includes('already exists') ? 'A user with that email already exists' : 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add user');
    }
  };

  const startEditUser = (u: any) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, role: u.role });
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setUserForm({});
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          // Only Super Admins may change roles (backend enforces this too)
          ...(user?.role === 'super_admin' ? { role: userForm.role } : {}),
          actor: user?.name || 'admin',
          actorRole: user?.role || '',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
        closeEditUser();
        onDataChange?.();
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, actor: user?.name || 'admin', actorRole: user?.role || '' }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        onDataChange?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const roleCounts = roles.map((role) => ({
    role,
    count: users.filter(u => u.role === role).length,
  }));

  const getInitials = (name: string) =>
    name.split(' ').map(w => w.charAt(0)).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">User Management</h2>
          <p className="text-slate-600 dark:text-dark-text-secondary mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setNewUser({ name: '', email: '', role: 'user' });
              setShowAddUser(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-full text-sm font-medium text-slate-700 dark:text-dark-text">
            <Users className="w-4 h-4 text-[#9370DB]" />
            {users.length} total
          </span>
          {roleCounts.map(({ role, count }) =>
            count > 0 ? (
              <span
                key={role}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                  role === 'super_admin'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : role === 'admin'
                    ? 'bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet'
                    : role === 'user'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[#60A5FA]/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {count} {role}
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputCls} pl-10`}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EEF8] dark:border-dark-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">User</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary hidden md:table-cell">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEF8] dark:divide-dark-border">
            {paginatedUsers.map((u, i) => (
              <tr key={u.id} className="hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-dark-text truncate">{u.name}</div>
                      <div className="text-sm text-slate-500 dark:text-dark-text-secondary truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  {u.role === 'super_admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Super Admin
                    </span>
                  ) : u.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium capitalize">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      u.role === 'user'
                        ? 'bg-slate-500/10 text-slate-600 dark:text-dark-text-secondary'
                        : 'bg-[#60A5FA]/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      <UserCircle2 className="w-3.5 h-3.5" />
                      {roleLabel(u.role)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-dark-text-secondary">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {u.createdAt}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {user?.role === 'super_admin' ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.role === 'super_admin' || u.id === user?.id}
                        className="px-2.5 py-1.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-700 dark:text-dark-text text-sm focus:outline-none focus:border-[#9370DB] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          u.role === 'super_admin'
                            ? 'Super Admin accounts cannot be changed'
                            : u.id === user?.id
                            ? 'You cannot change your own role'
                            : 'Change role'
                        }
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2.5 py-1.5 text-sm text-slate-600 dark:text-dark-text-secondary capitalize">
                        {roleLabel(u.role)}
                      </span>
                    )}
                    <button
                      onClick={() => startEditUser(u)}
                      disabled={u.role === 'super_admin' && user?.role !== 'super_admin'}
                      className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={u.role === 'super_admin' && user?.role !== 'super_admin' ? 'Super Admin only' : 'Edit user'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDeleteUser(u)}
                      disabled={u.role === 'super_admin' && user?.role !== 'super_admin'}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={u.role === 'super_admin' && user?.role !== 'super_admin' ? 'Super Admin only' : 'Delete user'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-dark-text-secondary">No users found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F0EEF8] dark:border-dark-border">
            <span className="text-sm text-slate-500 dark:text-dark-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text rounded-lg text-sm font-medium hover:bg-[#EAE7F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 bg-[#9370DB] text-white rounded-lg text-sm font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`${cardCls} p-6 max-w-md w-full animate-scale-in`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">Edit User</h3>
              <button
                onClick={closeEditUser}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={userForm.name || ''}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Role</label>
                {user?.role === 'super_admin' ? (
                  <select
                    value={userForm.role || 'user'}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    disabled={editingUser?.role === 'super_admin' || editingUser?.id === user?.id}
                    className={`${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-700 dark:text-dark-text text-sm capitalize">
                    {roleLabel(userForm.role || 'user')}
                    <span className="text-xs text-slate-400 dark:text-dark-text-secondary ml-2">
                      (role changes are Super Admin only)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#F0EEF8] dark:border-dark-border">
                <button
                  onClick={closeEditUser}
                  className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`${cardCls} p-6 max-w-md w-full animate-scale-in`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">Add User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Role</label>
                {user?.role === 'super_admin' ? (
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-700 dark:text-dark-text text-sm capitalize">
                    {roleLabel(newUser.role)}
                    <span className="text-xs text-slate-400 dark:text-dark-text-secondary ml-2">
                      (role changes are Super Admin only)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[#F0EEF8] dark:border-dark-border">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal for destructive actions */}
      <ConfirmModal
        open={!!confirmState}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        danger={confirmState?.danger}
        confirmLabel={confirmState?.danger ? 'Delete' : 'Confirm'}
        onConfirm={() => {
          confirmState?.action();
          setConfirmState(null);
        }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
