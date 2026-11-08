import { apiFetch } from '@/lib/api-client';

/** Queries public global search and preserves its error response contract. */
export async function Search(busqueda: string, page: number) {
  const params = new URLSearchParams({ q: busqueda, page: page.toString() });
  const path = `search?${params.toString()}`;
  const response = await apiFetch(path, { target: 'public' });
  const resultados = await response.json();
  if (resultados.error) {
    return { data: [], error: resultados.error, message: resultados.message };
  }
  return resultados;
}
