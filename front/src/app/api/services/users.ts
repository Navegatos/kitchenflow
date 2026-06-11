import { api } from '../client';
import type { BackendUser } from '../types';
import { mapFrontendRole, splitFullName } from '../mappers';
import type { AppUser } from '../../data/mockData';

export async function listUsers(params?: { active_only?: boolean; role?: string }): Promise<BackendUser[]> {
  return api.get<BackendUser[]>('/users', params);
}

export async function getUser(userId: string): Promise<BackendUser> {
  return api.get<BackendUser>(`/users/${userId}`);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: AppUser['role'];
}): Promise<BackendUser> {
  const { first_name, last_name } = splitFullName(data.name);
  return api.post<BackendUser>('/users', {
    email: data.email,
    first_name,
    last_name,
    password: data.password,
    role: mapFrontendRole(data.role),
  });
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<AppUser, 'name' | 'email' | 'role' | 'active'>>,
): Promise<BackendUser> {
  const body: Record<string, unknown> = {};
  if (data.name) {
    const { first_name, last_name } = splitFullName(data.name);
    body.first_name = first_name;
    body.last_name = last_name;
  }
  if (data.email !== undefined) body.email = data.email;
  if (data.role !== undefined) body.role = mapFrontendRole(data.role);
  if (data.active !== undefined) body.active = data.active;
  return api.patch<BackendUser>(`/users/${userId}`, body);
}

export async function resetUserPassword(userId: string, password: string): Promise<void> {
  await api.post(`/users/${userId}/password`, { password });
}
