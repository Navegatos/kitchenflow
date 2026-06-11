import { api } from '../client';
import type { BackendRole } from '../types';

export interface PermissionsConfig {
  routes: Record<string, BackendRole[]>;
  features: Record<string, { label: string; roles: Record<BackendRole, boolean> }>;
  role_home: Record<BackendRole, string>;
  role_labels: Record<BackendRole, string>;
}

export async function getPermissionsConfig(): Promise<PermissionsConfig> {
  return api.get<PermissionsConfig>('/permissions');
}
