'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'universities' | 'regions'>('universities');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

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
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [uniRes, regionRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/universities'),
        fetch('http://localhost:5000/api/admin/regions'),
      ]);
      const uniData = await uniRes.json();
      const regionData = await regionRes.json();
      setUniversities(uniData);
      setRegions(regionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const endpoint = activeTab === 'universities' 
        ? 'http://localhost:5000/api/admin/universities'
        : 'http://localhost:5000/api/admin/regions';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchData();
        setIsEditing(false);
        setFormData({});
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const handleUpdate = async (id: number | string) => {
    try {
      const endpoint = activeTab === 'universities'
        ? `http://localhost:5000/api/admin/universities/${id}`
        : `http://localhost:5000/api/admin/regions/${id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchData();
        setIsEditing(false);
        setEditingItem(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = activeTab === 'universities'
        ? `http://localhost:5000/api/admin/universities/${id}`
        : `http://localhost:5000/api/admin/regions/${id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsEditing(true);
  };

  const startCreate = () => {
    setEditingItem(null);
    setFormData(activeTab === 'universities' 
      ? { name: '', location: '', province: '', region: '', description: '' }
      : { name: '' }
    );
    setIsEditing(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#C8C8E0] dark:bg-dark-bg-secondary border-b border-[#A8A8C8] dark:border-dark-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <a href="/explore" className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors text-sm">
                  Explore
                </a>
                <a href="/chat" className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors text-sm">
                  Chat
                </a>
                <a href="/settings" className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors text-sm">
                  Settings
                </a>
                <a href="/admin" className="text-[#9370DB] dark:text-dark-violet font-semibold text-sm">
                  Admin
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-800 dark:text-dark-text">
                {user.name} (Admin)
              </span>
              <button
                onClick={() => {
                  // Preserve profile data before clearing user
                  const currentUser = localStorage.getItem('user');
                  if (currentUser) {
                    const parsedUser = JSON.parse(currentUser);
                    localStorage.setItem('userProfileData', JSON.stringify({
                      name: parsedUser.name,
                      profilePicture: parsedUser.profilePicture,
                    }));
                  }
                  
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="text-sm text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">Admin Dashboard</h1>
        <p className="text-slate-800 dark:text-dark-text-secondary mb-8">Manage universities and regions</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('universities')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'universities'
                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                : 'bg-[#C8C8E0] dark:bg-dark-bg-secondary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-tertiary'
            }`}
          >
            Universities
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'regions'
                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                : 'bg-[#C8C8E0] dark:bg-dark-bg-secondary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-tertiary'
            }`}
          >
            Regions
          </button>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
          >
            + Add New {activeTab === 'universities' ? 'University' : 'Region'}
          </button>
        </div>

        {/* Edit/Create Form */}
        {isEditing && (
          <div className="mb-6 p-4 bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'universities' ? 'University' : 'Region'}
            </h3>
            <div className="space-y-4">
              {activeTab === 'universities' ? (
                <>
                  <input
                    type="text"
                    placeholder="University Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                  />
                  <input
                    type="text"
                    placeholder="Province"
                    value={formData.province || ''}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                  />
                  <select
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                  >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    rows={3}
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Region Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => editingItem ? handleUpdate(editingItem.id || editingItem.name) : handleCreate()}
                  className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg overflow-hidden">
          {activeTab === 'universities' ? (
            <table className="w-full">
              <thead className="bg-[#A8A8C8] dark:bg-dark-bg-tertiary">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Name</th>
                  <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Location</th>
                  <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Region</th>
                  <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((uni) => (
                  <tr key={uni.id} className="border-t border-[#A8A8C8] dark:border-dark-border">
                    <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.name}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.location}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.region}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(uni)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(uni.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 space-y-2">
              {regions.map((region) => (
                <div key={region} className="flex justify-between items-center p-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary rounded-lg">
                  <span className="text-slate-800 dark:text-dark-text">{region}</span>
                  <button
                    onClick={() => handleDelete(region)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
