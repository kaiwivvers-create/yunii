'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '../../../components/Navbar';

export default function AdminUsers() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/explore');
      return;
    }
    setUser(parsedUser);
    fetchUsers();
  }, [router]);

  const fetchUsers = () => {
    // Mock data - will connect to backend when ready
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-02-20' },
      { id: 3, name: 'Admin User', email: 'admin@universe.com', role: 'admin', createdAt: '2024-01-01' },
    ]);
  };

  const handleDelete = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
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

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Navigation */}
      <Navbar currentPage="admin" />

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">User Management</h1>
        <p className="text-slate-800 dark:text-dark-text-secondary mb-8">Manage user accounts and permissions</p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#9370DB] dark:bg-dark-violet text-white">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="border-b border-[#A8A8C8] dark:border-dark-border hover:bg-[#A8A8C8] dark:hover:bg-dark-bg-tertiary">
                  <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{u.name}</td>
                  <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded text-slate-800 dark:text-dark-text text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 bg-[#ff6b6b] text-white rounded hover:bg-[#ff5252] transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-dark-text-secondary">
              No users found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-800 dark:text-dark-text">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
