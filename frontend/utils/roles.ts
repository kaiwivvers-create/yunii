/**
 * Shared role & permission helpers.
 *
 * Roles: user | admin | super_admin
 * Permissions are stored per role and served by the backend; a logged-in
 * user object carries its effective `permissions` array.
 */

export const ADMIN_ROLES: string[] = ['admin', 'super_admin'];
export const SUPER_ADMIN_ROLE = 'super_admin';

export const ALL_PERMISSIONS: string[] = [
  'manage_content',
  'manage_users',
  'manage_settings',
  'view_reports',
  'manage_system',
];

export const PERMISSION_LABELS: Record<string, string> = {
  manage_content: 'Manage content',
  manage_users: 'Manage users',
  manage_settings: 'Manage settings',
  view_reports: 'View reports',
  manage_system: 'Manage system',
};

/** True for both admin and super_admin roles. */
export function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

/** True only for the super_admin role. */
export function isSuperAdmin(role?: string | null): boolean {
  return role === SUPER_ADMIN_ROLE;
}

/** Effective permissions for a user object (falls back to all for admin roles). */
export function permissionsFor(user: any): string[] {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length) {
    return user.permissions;
  }
  return isAdminRole(user.role) ? [...ALL_PERMISSIONS] : [];
}

export function hasPermission(user: any, permission: string): boolean {
  return permissionsFor(user).includes(permission);
}

/** Which permission unlocks each admin section. */
export const SECTION_PERMISSION: Record<string, string> = {
  content: 'manage_content',
  users: 'manage_users',
  activity: 'manage_system',
  versions: 'manage_system',
  reports: 'view_reports',
  database: 'manage_system',
  roles: 'manage_users',
  permissions: 'manage_users',
  settings: 'manage_settings',
};

/** Human-readable role names. */
export function roleLabel(role?: string | null): string {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return role || 'User';
}
