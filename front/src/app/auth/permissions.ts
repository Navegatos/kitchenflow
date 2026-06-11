import type { BackendRole } from '../api/types';
import type { PermissionsConfig } from '../api/services/permissions';

const FALLBACK_ROLE_HOME: Record<BackendRole, string> = {
  ADMIN: '/',
  MANAGER: '/',
  CHEF: '/recetas',
  WAITER: '/inventario',
};

const FALLBACK_ROLE_LABELS: Record<BackendRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CHEF: 'Chef',
  WAITER: 'Mesero/a',
};

let cachedConfig: PermissionsConfig | null = null;

export function setPermissionsConfig(config: PermissionsConfig): void {
  cachedConfig = config;
}

export function getPermissionsConfig(): PermissionsConfig | null {
  return cachedConfig;
}

export function getRoleLabels(): Record<BackendRole, string> {
  return cachedConfig?.role_labels ?? FALLBACK_ROLE_LABELS;
}

export function normalizeRole(role: string): BackendRole {
  const upper = role.toUpperCase() as BackendRole;
  const labels = getRoleLabels();
  if (upper in labels) return upper;
  return 'WAITER';
}

export function canAccessPath(role: BackendRole | string, path: string): boolean {
  const normalized = normalizeRole(role);
  const routes = cachedConfig?.routes;
  if (!routes) return true;
  const allowed = routes[path];
  if (!allowed) return true;
  return allowed.includes(normalized);
}

export function getHomePath(role: BackendRole | string): string {
  const normalized = normalizeRole(role);
  return cachedConfig?.role_home[normalized] ?? FALLBACK_ROLE_HOME[normalized];
}

export function getAccessibleNavPaths(role: BackendRole | string): string[] {
  const normalized = normalizeRole(role);
  const routes = cachedConfig?.routes;
  if (!routes) return [];
  return Object.entries(routes)
    .filter(([, roles]) => roles.includes(normalized))
    .map(([path]) => path);
}

export function getFeaturePermissions(): PermissionsConfig['features'] | null {
  return cachedConfig?.features ?? null;
}

/** @deprecated use getRoleLabels() */
export const ROLE_LABELS = FALLBACK_ROLE_LABELS;
