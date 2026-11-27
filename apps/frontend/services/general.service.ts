import { apiFetch } from '@/lib/api-client';

/** Collects all pages for authenticated administration selectors. */
export const fetchAllPages = async <T>(path: string, limit: number): Promise<T[]> => {
  const collected: T[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const separator = path.includes('?') ? '&' : '?';
      const response = await apiFetch(`${path}${separator}page=${page}&limit=${limit}`);
      if (!response.ok) break;
      const data = await response.json();
      collected.push(...((data.data || []) as T[]));
      totalPages = data.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
  } catch (error) {
    console.error('Error fetching selector options:', error);
  }

  return collected;
};
