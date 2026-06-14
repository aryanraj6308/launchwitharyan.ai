export function apiUrl(path: string): string {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL)
    ? import.meta.env.PUBLIC_API_URL.replace(/\/+$/, '')
    : 'http://localhost:8000';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
