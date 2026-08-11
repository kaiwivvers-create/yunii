'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ScrollText,
  History,
  BarChart3,
  Database,
  ShieldCheck,
  Settings,
  UserCog,
} from 'lucide-react';
import { hasPermission, isSuperAdmin, SECTION_PERMISSION } from '@/utils/roles';

export type AdminSection =
  | 'overview'
  | 'content'
  | 'users'
  | 'activity'
  | 'versions'
  | 'reports'
  | 'database'
  | 'roles'
  | 'permissions'
  | 'settings';

interface SidebarItem {
  id: AdminSection;
  label: string;
  icon: any;
  href: string;
}

const items: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { id: 'content', label: 'Content', icon: GraduationCap, href: '/admin?section=content' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin?section=users' },
  { id: 'activity', label: 'Activity Log', icon: ScrollText, href: '/admin?section=activity' },
  { id: 'versions', label: 'Versions', icon: History, href: '/admin?section=versions' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin?section=reports' },
  { id: 'database', label: 'Database', icon: Database, href: '/admin?section=database' },
  { id: 'roles', label: 'Roles', icon: UserCog, href: '/admin?section=roles' },
  { id: 'permissions', label: 'Permissions', icon: ShieldCheck, href: '/admin?section=permissions' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin?section=settings' },
];

interface AdminSidebarProps {
  active: AdminSection;
  onNavigate?: (section: AdminSection) => void;
  /** Logged-in user; sections they lack permission for are hidden. */
  user?: any;
}

export default function AdminSidebar({ active, onNavigate, user }: AdminSidebarProps) {
  // Roles & Permissions are system-level sections — Super Admin only.
  const superAdminOnly = new Set(['roles', 'permissions']);
  const visibleItems = items.filter(
    (item) =>
      item.id === 'overview' ||
      (superAdminOnly.has(item.id) ? isSuperAdmin(user?.role) : hasPermission(user, SECTION_PERMISSION[item.id] || '')),
  );

  return (
    <aside className="w-16 lg:w-56 shrink-0">
      <div className="sticky top-20 space-y-1">
        {visibleItems.map(({ id, label, icon: Icon, href }) => {
          const isActive = active === id;
          const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
            isActive
              ? 'bg-[#9370DB] text-white shadow-md shadow-[#9370DB]/30'
              : 'text-slate-600 dark:text-dark-text-secondary hover:bg-[#EAE7F6] dark:hover:bg-dark-bg-tertiary hover:text-[#9370DB]'
          }`;
          const inner = (
            <>
              <Icon className="w-5 h-5 shrink-0 mx-auto lg:mx-0" />
              <span className="hidden lg:inline whitespace-nowrap">{label}</span>
            </>
          );
          // In-page sections call onNavigate; when it's absent (standalone use) fall back to the href link.
          return onNavigate ? (
            <button key={id} onClick={() => onNavigate(id)} className={cls} title={label}>
              {inner}
            </button>
          ) : (
            <Link key={id} href={href} className={cls} title={label}>
              {inner}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
