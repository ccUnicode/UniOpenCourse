import { apiFetch } from '@/lib/api-client';
import { throwApiError } from '@/lib/api-errors';
import type { AdminUsersPage } from '@/interfaces/user.interface';

interface UserListOptions {
  search?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

/** Loads registered users through the session-aware proxy; errors are not empty results. */
export async function getAdminUsers({
  search = '',
  page = 1,
  limit = 10,
  signal,
}: UserListOptions = {}): Promise<AdminUsersPage> {
  const query = new URLSearchParams({
    search: search.trim(),
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(`admin/users?${query}`, { signal, cache: 'no-store' });

  if (response.status === 401) {
    throw new Error(
      'Tu sesión ha expirado. Inicia sesión nuevamente como administrador.',
    );
  }
  if (response.status === 403) {
    throw new Error('No tienes permisos para consultar los usuarios.');
  }
  if (!response.ok) await throwApiError(response, 'No se pudieron cargar los usuarios.');

  return response.json() as Promise<AdminUsersPage>;
}
