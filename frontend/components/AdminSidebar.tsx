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
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
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
}

export default function AdminSidebar({ active, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="w-16 lg:w-56 shrink-0">
      <div className="sticky top-20 space-y-1">
        {items.map(({ id, label, icon: Icon, href }) => {
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
          // 'users' is a separate route — always navigate to it (in-page sections can't render it)
          const isRouteLink = onNavigate && id === 'users';
          return isRouteLink || !onNavigate ? (
            <Link key={id} href={href} className={cls} title={label}>
              {inner}
            </Link>
          ) : (
            <button key={id} onClick={() => onNavigate(id)} className={cls} title={label}>
              {inner}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
