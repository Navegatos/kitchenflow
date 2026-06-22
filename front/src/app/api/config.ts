const DEFAULT_API_URL = 'http://localhost:8000';

/**
 * Base URL sin trailing slash.
 * - Desarrollo: http://localhost:8000 (por defecto).
 * - Prod/QA detrás de nginx: VITE_API_URL="" → same-origin (rutas /api/v1/...).
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv !== undefined) {
    return fromEnv.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_URL;
}

/** Prefijo de rutas REST del backend. */
export function getApiV1Url(): string {
  return `${getApiBaseUrl()}/api/v1`;
}
