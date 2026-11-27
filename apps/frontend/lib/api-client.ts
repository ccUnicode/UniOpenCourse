export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ApiTarget = 'authenticated' | 'public' | 'auth' | 'backend';

export interface ApiFetchOptions extends RequestInit {
  target?: ApiTarget;
}

/**
 * Shared HTTP transport. Authenticated browser calls use the cookie-aware proxy;
 * auth calls use Next.js handlers, and public/server calls use an absolute URL.
 * Callers retain the Response so each service can preserve its error contract.
 */
export function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { target = 'authenticated', ...init } = options;
  const normalizedPath = path.replace(/^\/+/, '');
  const headers = new Headers(init.headers);

  if (target === 'backend' && typeof window !== 'undefined') {
    throw new Error('Backend forwarding is only available on the server');
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const sameOrigin = target === 'authenticated' || target === 'auth';
  const backendUrl =
    typeof window === 'undefined' ? process.env.API_URL || API_URL : API_URL;
  const url = sameOrigin
    ? `/api/${target === 'auth' ? 'auth' : 'proxy'}/${normalizedPath}`
    : `${backendUrl.replace(/\/$/, '')}/${normalizedPath}`;

  return fetch(url, {
    ...init,
    ...(sameOrigin ? { credentials: 'include' } : {}),
    headers,
  });
}
