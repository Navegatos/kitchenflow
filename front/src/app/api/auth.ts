import type { LoginResponse } from './types';
import { api } from './client';

const SESSION_KEY = 'kitchenflow_session';

export function getStoredSession(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function storeSession(session: LoginResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', { email, password });
  storeSession(data);
  return data;
}

export function logout(): void {
  clearSession();
}

/** Revalida la sesión local contra el backend (usuario activo y existente). */
export async function validateSession(): Promise<LoginResponse | null> {
  const session = getStoredSession();
  if (!session?.sub) return null;

  try {
    const data = await api.get<LoginResponse>('/auth/me', { user_id: session.sub });
    storeSession(data);
    return data;
  } catch {
    clearSession();
    return null;
  }
}
