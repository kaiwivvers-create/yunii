'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AdminSidebar, { AdminSection } from '../../components/AdminSidebar';
import ConfirmModal from '../../components/ConfirmModal';
import ActivityLog from '../../components/admin/ActivityLog';
import Reports from '../../components/admin/Reports';
import DatabaseSection from '../../components/admin/DatabaseSection';
import PermissionsSection from '../../components/admin/PermissionsSection';
import RolesSection from '../../components/admin/RolesSection';
import SettingsSection from '../../components/admin/SettingsSection';
import VersionHistory from '../../components/admin/VersionHistory';
import {
  LayoutDashboard,
  GraduationCap,
  Globe,
  Users,
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  MapPin,
  X,
} from 'lucide-react';

type TabId = 'overview' | 'universities' | 'regions' | 'details';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'universities', label: 'Universities', icon: GraduationCap },
  { id: 'regions', label: 'Regions', icon: Globe },
  { id: 'details', label: 'Details', icon: BookOpen },
];

const inputCls =
  'w-full px-4 py-2.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-400 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet focus:ring-2 focus:ring-[#9370DB]/20 transition-all';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [regionSearchQuery, setRegionSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    action: () => void;
  } | null>(null);

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

    // Read the ?section= query param (e.g. when arriving from /admin/users sidebar)
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') as AdminSection | null;
    if (section && ['overview', 'content', 'activity', 'versions', 'reports', 'database', 'roles', 'permissions', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [uniRes, regRes, usersRes] = await Promise.all([
        fetch('/api/admin/universities'),
        fetch('/api/admin/regions'),
        fetch('/api/admin/users'),
      ]);
      if (uniRes.ok) setUniversities(await uniRes.json());
      if (regRes.ok) setRegions(await regRes.json());
      if (usersRes.ok) {
        const users = await usersRes.json();
        setUsersCount(users.length);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleCreate = async () => {
    if (activeTab === 'universities') {
      try {
        const res = await fetch('/api/admin/universities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const created = await res.json();
          setUniversities([...universities, created]);
        } else {
          alert('Failed to create university');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to create university');
      }
    } else {
      try {
        const res = await fetch('/api/admin/regions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name }),
        });
        const newName = formData.name.trim();
        if (res.ok && !regions.includes(newName)) {
          setRegions([...regions, newName]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsEditing(false);
    setFormData({});
  };

  const handleUpdate = async (id: number | string) => {
    if (activeTab === 'universities') {
      try {
        const res = await fetch(`/api/admin/universities/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setUniversities(universities.map(u => u.id === id ? { ...u, ...updated } : u));
        } else {
          alert('Failed to update university');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to update university');
      }
    } else if (activeTab === 'regions') {
      try {
        const res = await fetch(`/api/admin/regions/${encodeURIComponent(String(id))}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name }),
        });
        const newName = formData.name.trim();
        if (res.ok) {
          const updatedRegions = await res.json();
          setRegions(updatedRegions);
          setUniversities(universities.map(u => u.region === id ? { ...u, region: newName } : u));
        } else {
          alert('Failed to update region');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to update region');
      }
    }
    setIsEditing(false);
    setEditingItem(null);
    setFormData({});
  };

  const requestDelete = (type: 'university' | 'region', id: number | string, label: string) => {
    setConfirmState({
      title: `Delete ${type}`,
      message: `Are you sure you want to delete "${label}"? It goes to the trash and can be reverted from the Activity Log.`,
      danger: true,
      action: () => handleDelete(type, id),
    });
  };

  const handleDelete = async (type: 'university' | 'region', id: number | string) => {
    if (type === 'university') {
      try {
        const res = await fetch(`/api/admin/universities/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setUniversities(universities.filter(u => u.id !== id));
          const totalPages = Math.ceil((universities.length - 1) / itemsPerPage);
          if (currentPage > totalPages && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetch(`/api/admin/regions/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
        if (res.ok) {
          setRegions(regions.filter(r => r !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveDetails = async () => {
    if (!selectedUniversity) return;
    const detailsToSave = { ...formData };
    if (typeof detailsToSave.details === 'string') {
      detailsToSave.details = detailsToSave.details.split('\n').filter((l: string) => l.trim() !== '');
    }
    try {
      const res = await fetch(`/api/admin/universities/${selectedUniversity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          details: detailsToSave,
          image: formData.image || selectedUniversity.image,
          rankings: formData.rankings,
          pros: Array.isArray(formData.pros) ? formData.pros : String(formData.pros || '').split('\n').filter((l: string) => l.trim() !== ''),
          cons: Array.isArray(formData.cons) ? formData.cons : String(formData.cons || '').split('\n').filter((l: string) => l.trim() !== ''),
          scholarships: formData.scholarships,
          applicationDeadlines: formData.applicationDeadlines,
          costOfLiving: formData.costOfLiving,
          visa: formData.visa,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUniversities(universities.map(u => u.id === selectedUniversity.id ? { ...u, ...updated } : u));
        setSelectedUniversity(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestClearDetails = () => {
    if (!selectedUniversity) return;
    setConfirmState({
      title: 'Clear all details?',
      message: `Clear all details for "${selectedUniversity.name}"? A new version is saved, so you can revert it.`,
      danger: true,
      action: clearDetails,
    });
  };

  const clearDetails = async () => {
    if (!selectedUniversity) return;
    const emptyDetails = {
      overview: '',
      details: [],
      courses: [],
      requirements: [],
      prices: { undergraduate: '', graduate: '' },
    };
    try {
      const res = await fetch(`/api/admin/universities/${selectedUniversity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: emptyDetails, image: '' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUniversities(universities.map(u => u.id === selectedUniversity.id ? { ...u, ...updated } : u));
        setSelectedUniversity({ ...selectedUniversity, details: emptyDetails, image: '' });
        setFormData(emptyDetails);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (item: any) => {
    if (typeof item === 'string') {
      setEditingItem({ name: item });
      setFormData({ name: item });
    } else {
      setEditingItem(item);
      setFormData(item);
    }
    setIsEditing(true);
  };

  const startCreate = () => {
    setEditingItem(null);
    setFormData(activeTab === 'universities'
      ? { name: '', location: '', province: '', region: '', description: '', image: '' }
      : { name: '' }
    );
    setIsEditing(true);
  };

  const quickAddUniversity = () => {
    setActiveSection('content');
    setActiveTab('universities');
    setEditingItem(null);
    setFormData({ name: '', location: '', province: '', region: '', description: '', image: '' });
    setIsEditing(true);
  };

  const quickAddRegion = () => {
    setActiveSection('content');
    setActiveTab('regions');
    setEditingItem(null);
    setFormData({ name: '' });
    setIsEditing(true);
  };

  const getFilteredUniversities = () => {
    return universities.filter(uni => {
      const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          uni.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterRegion === 'All' || uni.region === filterRegion;
      return matchesSearch && matchesFilter;
    });
  };

  const programsCount = universities.reduce(
    (sum, u) => sum + (u.details?.courses?.length || 0),
    0
  );

  const stats = [
    { label: 'Universities', value: universities.length, icon: GraduationCap, accent: 'text-[#9370DB] bg-[#9370DB]/10' },
    { label: 'Regions', value: regions.length, icon: Globe, accent: 'text-[#60A5FA] bg-[#60A5FA]/10' },
    { label: 'Users', value: usersCount, icon: Users, accent: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Programs', value: programsCount, icon: BookOpen, accent: 'text-amber-500 bg-amber-500/10' },
  ];

  const recentUniversities = [...universities].sort((a, b) => b.id - a.id).slice(0, 5);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative">
      {/* Navigation */}
      <Navbar currentPage="admin" />

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-dark-text-secondary mt-1">
            Manage universities, regions, users, and system settings
          </p>
        </div>

        <div className="flex gap-6 lg:gap-10 items-start">
          {/* Sidebar */}
          <AdminSidebar active={activeSection} onNavigate={setActiveSection} />
          <div className="hidden lg:block w-px self-stretch bg-[#E2E0F0] dark:bg-dark-border" />

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Content pill tabs — shown inside the Content section */}
            {activeSection === 'content' && (
              <div className="inline-flex items-center gap-1 bg-[#EAE7F6] dark:bg-dark-bg-tertiary p-1 rounded-full mb-6 overflow-x-auto max-w-full">
                {tabs.filter(t => t.id !== 'overview').map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === id
                        ? 'bg-[#9370DB] dark:bg-dark-violet text-white shadow-md'
                        : 'text-slate-600 dark:text-dark-text-secondary hover:text-[#9370DB] dark:hover:text-dark-violet'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            )}

        {/* ============ OVERVIEW ============ */}
        {activeSection === 'overview' && (
          <div className="space-y-10">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className={`${cardCls} p-5 flex items-center gap-4`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-slate-900 dark:text-dark-text leading-none">{value}</div>
                    <div className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={quickAddUniversity}
                  className={`${cardCls} p-5 text-left group hover:border-[#9370DB]/50 hover:shadow-md transition-all`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center mb-3 group-hover:bg-[#9370DB] group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-dark-text">Add University</div>
                  <div className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1">Create a new university listing</div>
                </button>
                <button
                  onClick={quickAddRegion}
                  className={`${cardCls} p-5 text-left group hover:border-[#9370DB]/50 hover:shadow-md transition-all`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center mb-3 group-hover:bg-[#60A5FA] group-hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-dark-text">Add Region</div>
                  <div className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1">Add a new geographic region</div>
                </button>
                <Link
                  href="/admin/users"
                  className={`${cardCls} p-5 text-left group hover:border-[#9370DB]/50 hover:shadow-md transition-all`}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-dark-text">Manage Users</div>
                  <div className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1">View and manage user accounts</div>
                </Link>
              </div>
            </div>

            {/* Recently added */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary mb-3">
                Recently Added
              </h2>
              <div className={`${cardCls} divide-y divide-[#F0EEF8] dark:divide-dark-border overflow-hidden`}>
                {recentUniversities.map((uni) => (
                  <div key={uni.id} className="flex items-center gap-4 p-4 hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-dark-text truncate">{uni.name}</div>
                      <div className="text-sm text-slate-500 dark:text-dark-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {uni.location}
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium">
                      {uni.region}
                    </span>
                    <button
                      onClick={() => {
                        setActiveSection('content');
                        setActiveTab('universities');
                        setSearchQuery(uni.name);
                        startEdit(uni);
                      }}
                      className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDelete('university', uni.id, uni.name)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {recentUniversities.length === 0 && (
                  <div className="p-10 text-center">
                    <p className="text-slate-500 dark:text-dark-text-secondary">No universities yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ UNIVERSITIES ============ */}
        {activeSection === 'content' && activeTab === 'universities' && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={`${inputCls} sm:w-48`}
              >
                <option value="All">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={startCreate}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
              >
                <Plus className="w-4 h-4" />
                Add University
              </button>
            </div>

            {/* Table */}
            <div className={`${cardCls} overflow-hidden`}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0EEF8] dark:border-dark-border">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">University</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary hidden md:table-cell">Location</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary hidden lg:table-cell">Region</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEF8] dark:divide-dark-border">
                  {getFilteredUniversities()
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((uni) => (
                      <tr key={uni.id} className="hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center shrink-0">
                              <GraduationCap className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-dark-text">{uni.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-dark-text-secondary hidden md:table-cell">{uni.location}</td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium">
                            {uni.region}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(uni)}
                              className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => requestDelete('university', uni.id, uni.name)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {getFilteredUniversities().length === 0 && (
                <div className="p-12 text-center">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-dark-text-secondary">No universities found</p>
                </div>
              )}

              {/* Pagination */}
              {getFilteredUniversities().length > itemsPerPage && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F0EEF8] dark:border-dark-border">
                  <span className="text-sm text-slate-500 dark:text-dark-text-secondary">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, getFilteredUniversities().length)} of {getFilteredUniversities().length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text rounded-lg text-sm font-medium hover:bg-[#EAE7F6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getFilteredUniversities().length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(getFilteredUniversities().length / itemsPerPage)}
                      className="px-4 py-1.5 bg-[#9370DB] text-white rounded-lg text-sm font-medium hover:bg-[#7B68EE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ============ REGIONS ============ */}
        {activeSection === 'content' && activeTab === 'regions' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search regions..."
                  value={regionSearchQuery}
                  onChange={(e) => setRegionSearchQuery(e.target.value)}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <button
                onClick={startCreate}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
              >
                <Plus className="w-4 h-4" />
                Add Region
              </button>
            </div>

            <div className={`${cardCls} divide-y divide-[#F0EEF8] dark:divide-dark-border overflow-hidden`}>
              {regions.filter(r => r.toLowerCase().includes(regionSearchQuery.toLowerCase())).map((region) => {
                const count = universities.filter(u => u.region === region).length;
                return (
                  <div key={region} className="flex items-center gap-4 p-4 hover:bg-[#F8F6FD] dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-dark-text">{region}</div>
                      <div className="text-sm text-slate-500 dark:text-dark-text-secondary">
                        {count} universit{count === 1 ? 'y' : 'ies'}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(region)}
                      className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                      title="Rename region"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDelete('region', region, region)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete region"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {regions.filter(r => r.toLowerCase().includes(regionSearchQuery.toLowerCase())).length === 0 && (
                <div className="p-12 text-center">
                  <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-dark-text-secondary">No regions found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ============ DETAILS ============ */}
        {activeSection === 'content' && activeTab === 'details' && (
          <div className={`${cardCls} flex flex-col lg:flex-row overflow-hidden`}>
            {/* Left - University list */}
            <div className="lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-[#F0EEF8] dark:border-dark-border p-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-3 px-1">
                Select University
              </h3>
              <div className="space-y-1.5">
                {getFilteredUniversities().map((uni) => (
                  <div
                    key={uni.id}
                    onClick={() => {
                      setSelectedUniversity(uni);
                      setEditingItem(uni);
                      setFormData({
                        ...(uni.details || {
                          overview: '',
                          details: '',
                          courses: [],
                          requirements: [],
                          prices: {
                            undergraduate: '',
                            graduate: ''
                          }
                        }),
                        image: uni.image,
                        rankings: uni.rankings,
                        pros: uni.pros,
                        cons: uni.cons,
                        scholarships: uni.scholarships,
                        applicationDeadlines: uni.applicationDeadlines,
                        costOfLiving: uni.costOfLiving,
                        visa: uni.visa,
                      });
                    }}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedUniversity?.id === uni.id
                        ? 'bg-[#9370DB]/10 border border-[#9370DB]/40 text-[#9370DB] dark:text-dark-violet'
                        : 'hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">{uni.name}</div>
                    <div className="text-xs text-slate-500 dark:text-dark-text-secondary truncate">{uni.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Details editor */}
            <div className="flex-1 min-w-0">
              {selectedUniversity ? (
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUniversity(null)}
                        className="p-2 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors lg:hidden"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">{selectedUniversity.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{selectedUniversity.location}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] dark:text-dark-violet rounded-full text-xs font-medium">
                      {selectedUniversity.region}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Image */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary">Image URL</label>
                      <input
                        type="text"
                        placeholder="University Image URL"
                        value={formData.image || selectedUniversity?.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className={inputCls}
                      />
                      {(formData.image || selectedUniversity?.image) && (
                        <div className="w-full h-44 bg-[#F4F2FA] dark:bg-dark-bg-tertiary rounded-xl overflow-hidden border border-[#F0EEF8] dark:border-dark-border">
                          <img
                            src={formData.image || selectedUniversity?.image}
                            alt="University preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Overview */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Overview</label>
                      <textarea
                        placeholder="University Overview"
                        value={formData.overview || ''}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        className={inputCls}
                        rows={4}
                      />
                    </div>

                    {/* Details */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Details</label>
                      <textarea
                        placeholder="One detail per line"
                        value={Array.isArray(formData.details) ? formData.details.join('\n') : (formData.details || '')}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className={inputCls}
                        rows={4}
                      />
                    </div>

                    {/* Courses */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Courses</label>
                      <div className="space-y-2">
                        {formData.courses?.map((course: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Course name"
                              value={course.name || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, name: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <input
                              type="text"
                              placeholder="Course details"
                              value={course.details || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, details: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <button
                              onClick={() => {
                                const newCourses = formData.courses.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              title="Remove course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, courses: [...(formData.courses || []), { name: '', details: '' }] })}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Course
                        </button>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Requirements</label>
                      <div className="space-y-2">
                        {formData.requirements?.map((req: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Requirement"
                              value={req}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements];
                                newReqs[index] = e.target.value;
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <button
                              onClick={() => {
                                const newReqs = formData.requirements.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              title="Remove requirement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, requirements: [...(formData.requirements || []), ''] })}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Requirement
                        </button>
                      </div>
                    </div>

                    {/* Prices */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Prices</label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Undergraduate price"
                          value={formData.prices?.undergraduate || ''}
                          onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, undergraduate: e.target.value } })}
                          className={inputCls}
                        />
                        <input
                          type="text"
                          placeholder="Graduate price"
                          value={formData.prices?.graduate || ''}
                          onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, graduate: e.target.value } })}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Rankings */}
                    <div className="border-t border-[#F0EEF8] dark:border-dark-border pt-5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                        Rankings
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="number"
                          placeholder="World rank (e.g. 5)"
                          value={formData.rankings?.overall || ''}
                          onChange={(e) => setFormData({ ...formData, rankings: { ...formData.rankings, overall: parseInt(e.target.value) || 0 } })}
                          className={inputCls}
                        />
                      </div>
                      <label className="block text-xs text-slate-500 dark:text-dark-text-secondary mb-1.5">
                        Program rankings — one per line: Program: rank (e.g. Computer Science: 3)
                      </label>
                      <textarea
                        placeholder="Computer Science: 3"
                        value={Object.entries(formData.rankings?.programs || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                        onChange={(e) => {
                          const programs: Record<string, number> = {};
                          e.target.value.split('\n').forEach((line) => {
                            const [k, v] = line.split(':');
                            if (k && v) programs[k.trim()] = parseInt(v) || 0;
                          });
                          setFormData({ ...formData, rankings: { ...formData.rankings, programs } });
                        }}
                        className={inputCls}
                        rows={3}
                      />
                    </div>

                    {/* Pros / Cons */}
                    <div className="border-t border-[#F0EEF8] dark:border-dark-border pt-5 grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                          Pros (one per line)
                        </label>
                        <textarea
                          placeholder="World-class faculty"
                          value={Array.isArray(formData.pros) ? formData.pros.join('\n') : String(formData.pros || '')}
                          onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                          className={inputCls}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                          Cons (one per line)
                        </label>
                        <textarea
                          placeholder="High tuition"
                          value={Array.isArray(formData.cons) ? formData.cons.join('\n') : String(formData.cons || '')}
                          onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                          className={inputCls}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Scholarships */}
                    <div className="border-t border-[#F0EEF8] dark:border-dark-border pt-5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                        Scholarships
                      </label>
                      <div className="space-y-2">
                        {(formData.scholarships || []).map((s: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={s.name || ''}
                              onChange={(e) => {
                                const list = [...formData.scholarships];
                                list[index] = { ...s, name: e.target.value };
                                setFormData({ ...formData, scholarships: list });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <input
                              type="text"
                              placeholder="Amount"
                              value={s.amount || ''}
                              onChange={(e) => {
                                const list = [...formData.scholarships];
                                list[index] = { ...s, amount: e.target.value };
                                setFormData({ ...formData, scholarships: list });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <input
                              type="text"
                              placeholder="Eligibility"
                              value={s.eligibility || ''}
                              onChange={(e) => {
                                const list = [...formData.scholarships];
                                list[index] = { ...s, eligibility: e.target.value };
                                setFormData({ ...formData, scholarships: list });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <button
                              onClick={() => setFormData({ ...formData, scholarships: formData.scholarships.filter((_: any, i: number) => i !== index) })}
                              className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              title="Remove scholarship"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, scholarships: [...(formData.scholarships || []), { name: '', amount: '', eligibility: '' }] })}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Scholarship
                        </button>
                      </div>
                    </div>

                    {/* Deadlines */}
                    <div className="border-t border-[#F0EEF8] dark:border-dark-border pt-5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                        Application Deadlines
                      </label>
                      <div className="space-y-2">
                        {(formData.applicationDeadlines || []).map((d: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Window (e.g. Fall 2027)"
                              value={d.window || ''}
                              onChange={(e) => {
                                const list = [...formData.applicationDeadlines];
                                list[index] = { ...d, window: e.target.value };
                                setFormData({ ...formData, applicationDeadlines: list });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <input
                              type="text"
                              placeholder="Deadline (e.g. 2027-01-05)"
                              value={d.deadline || ''}
                              onChange={(e) => {
                                const list = [...formData.applicationDeadlines];
                                list[index] = { ...d, deadline: e.target.value };
                                setFormData({ ...formData, applicationDeadlines: list });
                              }}
                              className={`${inputCls} flex-1`}
                            />
                            <button
                              onClick={() => setFormData({ ...formData, applicationDeadlines: formData.applicationDeadlines.filter((_: any, i: number) => i !== index) })}
                              className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              title="Remove deadline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, applicationDeadlines: [...(formData.applicationDeadlines || []), { window: '', deadline: '' }] })}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#9370DB] hover:bg-[#9370DB]/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Deadline
                        </button>
                      </div>
                    </div>

                    {/* Cost of living + Visa */}
                    <div className="border-t border-[#F0EEF8] dark:border-dark-border pt-5 grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                          Cost of Living
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Currency (e.g. USD)"
                            value={formData.costOfLiving?.currency || ''}
                            onChange={(e) => setFormData({ ...formData, costOfLiving: { ...formData.costOfLiving, currency: e.target.value } })}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            placeholder="Monthly (e.g. $1,200 - $2,400)"
                            value={formData.costOfLiving?.monthly || ''}
                            onChange={(e) => setFormData({ ...formData, costOfLiving: { ...formData.costOfLiving, monthly: e.target.value } })}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                          Visa
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Processing time (e.g. 4-8 weeks)"
                            value={formData.visa?.processTime || ''}
                            onChange={(e) => setFormData({ ...formData, visa: { ...formData.visa, processTime: e.target.value } })}
                            className={inputCls}
                          />
                          <textarea
                            placeholder="Requirements (one per line)"
                            value={Array.isArray(formData.visa?.requirements) ? formData.visa.requirements.join('\n') : String(formData.visa?.requirements || '')}
                            onChange={(e) => setFormData({ ...formData, visa: { ...formData.visa, requirements: e.target.value.split('\n').filter((l: string) => l.trim() !== '') } })}
                            className={inputCls}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save / Clear */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={requestClearDetails}
                        className="flex-1 px-4 py-3 border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors"
                      >
                        Clear Details
                      </button>
                      <button
                        onClick={saveDetails}
                        className="flex-1 px-4 py-3 bg-[#9370DB] text-white rounded-xl font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
                      >
                        Save Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-24">
                  <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 dark:text-dark-text-secondary">Select a university to edit its details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ ACTIVITY LOG ============ */}
        {activeSection === 'activity' && <ActivityLog />}

        {/* ============ VERSIONS ============ */}
        {activeSection === 'versions' && <VersionHistory />}

        {/* ============ REPORTS ============ */}
        {activeSection === 'reports' && <Reports />}

        {/* ============ DATABASE ============ */}
        {activeSection === 'database' && <DatabaseSection onDataChange={fetchData} />}

        {/* ============ ROLES ============ */}
        {activeSection === 'roles' && <RolesSection />}

        {/* ============ PERMISSIONS ============ */}
        {activeSection === 'permissions' && <PermissionsSection />}

        {/* ============ SETTINGS ============ */}
        {activeSection === 'settings' && <SettingsSection />}

        {/* ============ EDIT / CREATE MODAL ============ */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`${cardCls} p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                  {editingItem ? 'Edit' : 'Add New'} {activeTab === 'universities' ? 'University' : 'Region'}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {activeTab === 'universities' ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">University Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Harvard University"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Cambridge, USA"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Province</label>
                        <input
                          type="text"
                          placeholder="e.g. Massachusetts"
                          value={formData.province || ''}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Region</label>
                        <select
                          value={formData.region || ''}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">Select Region</option>
                          {regions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Image URL</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={formData.image || ''}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Description</label>
                        <textarea
                          placeholder="Short description of the university"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={inputCls}
                          rows={3}
                        />
                      </div>
                    </div>
                    {formData.image && (
                      <div className="w-full h-48 bg-[#F4F2FA] dark:bg-dark-bg-tertiary rounded-xl overflow-hidden border border-[#F0EEF8] dark:border-dark-border">
                        <img
                          src={formData.image}
                          alt="University preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1.5">Region Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Middle East"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t border-[#F0EEF8] dark:border-dark-border">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                    className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingItem) {
                        handleUpdate(editingItem.id || editingItem.name);
                      } else {
                        handleCreate();
                      }
                    }}
                    className="px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
                  >
                    {editingItem ? 'Save Changes' : 'Create'}
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
        </div>
      </section>
    </div>
  );
}
