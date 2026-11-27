import { apiFetch } from '@/lib/api-client';

/** Forwards a request from a Next.js handler to NestJS without a proxy loop. */
export function forwardBackendRequest(path: string, options: RequestInit = {}) {
  return apiFetch(path, { ...options, target: 'backend' });
}
