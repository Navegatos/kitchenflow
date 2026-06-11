const DEFAULT_API_URL = 'http://localhost:8000';

/** Base URL sin trailing slash (p. ej. http://localhost:8000). */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  return (fromEnv || DEFAULT_API_URL).replace(/\/+$/, '');
}

/** Prefijo de rutas REST del backend. */
export function getApiV1Url(): string {
  return `${getApiBaseUrl()}/api/v1`;
}
