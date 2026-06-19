import type { LoginResponse } from './types';
import { api } from './client';
import { clearSession, getStoredSession, storeSession } from './session';

export { clearSession, getAccessToken, getStoredSession, storeSession } from './session';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', { email, password });
  storeSession(data);
  return data;
}

export function logout(): void {
  clearSession();
}

/** Revalida la sesión local contra el backend (JWT vigente y usuario activo). */
export async function validateSession(): Promise<LoginResponse | null> {
  const session = getStoredSession();
  if (!session?.access_token) return null;

  try {
    const data = await api.get<LoginResponse>('/auth/me');
    storeSession(data);
    return data;
  } catch {
    clearSession();
    return null;
  }
}
