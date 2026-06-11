import type { BackendRole } from '../api/types';

export const ROUTE_PERMISSIONS: Record<string, BackendRole[]> = {
  '/': ['ADMIN', 'MANAGER'],
  '/inventario': ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'],
  '/ingreso-inventario': ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'],
  '/recetas': ['ADMIN', 'MANAGER', 'CHEF'],
  '/menu': ['ADMIN', 'MANAGER', 'CHEF'],
  '/finanzas': ['ADMIN', 'MANAGER'],
  '/ventas': ['ADMIN', 'MANAGER'],
  '/reportes': ['ADMIN', 'MANAGER'],
  '/mermas': ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'],
  '/usuarios': ['ADMIN'],
  '/configuracion': ['ADMIN'],
};

export const ROLE_HOME: Record<BackendRole, string> = {
  ADMIN: '/',
  MANAGER: '/',
  CHEF: '/recetas',
  WAITER: '/inventario',
};

export const ROLE_LABELS: Record<BackendRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CHEF: 'Chef',
  WAITER: 'Mesero/a',
};

export function normalizeRole(role: string): BackendRole {
  const upper = role.toUpperCase() as BackendRole;
  if (upper in ROLE_HOME) return upper;
  return 'WAITER';
}

export function canAccessPath(role: BackendRole | string, path: string): boolean {
  const normalized = normalizeRole(role);
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) return true;
  return allowed.includes(normalized);
}

export function getHomePath(role: BackendRole | string): string {
  return ROLE_HOME[normalizeRole(role)];
}

export function getAccessibleNavPaths(role: BackendRole | string): string[] {
  const normalized = normalizeRole(role);
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([, roles]) => roles.includes(normalized))
    .map(([path]) => path);
}
