import type { LoginResponse } from './types';

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

export function getAccessToken(): string | null {
  return getStoredSession()?.access_token ?? null;
}

export function storeSession(session: LoginResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
