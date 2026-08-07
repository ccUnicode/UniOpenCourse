export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Authenticated requests go through the Next.js proxy, which reads the HttpOnly
 * cookie and forwards the JWT to the NestJS backend as a Bearer token.
 */
export function apiFetch(path: string, options: RequestInit = {}) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`/api/proxy/${normalizedPath}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}
