import { apiFetch } from '@/lib/api-client';
import { throwApiError } from '@/lib/api-errors';
import type { AdminUsersPage, AdminUserDetail } from '@/interfaces/user.interface';

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

/** Loads a safe user profile; invalid/missing IDs return null, other failures remain errors. */
export async function getAdminUser(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserDetail | null> {
  if (!/^[1-9]\d*$/.test(userId) || Number(userId) > 2147483647) return null;

  const response = await apiFetch(`admin/users/${userId}`, { signal, cache: 'no-store' });
  if (response.status === 404) return null;
  if (response.status === 401) {
    throw new Error(
      'Tu sesión ha expirado. Inicia sesión nuevamente como administrador.',
    );
  }
  if (response.status === 403) {
    throw new Error('No tienes permisos para consultar este usuario.');
  }
  if (response.status >= 500) {
    throw new Error('No se pudo cargar el perfil del usuario. Intenta nuevamente.');
  }
  if (!response.ok)
    await throwApiError(response, 'No se pudo cargar el perfil del usuario.');

  return response.json() as Promise<AdminUserDetail>;
}
