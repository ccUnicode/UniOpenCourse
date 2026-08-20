import SearchResultCard from '@/components/search-result-card';
import { Search } from '@/services/search.service';
import { SearchResult } from '@/interfaces/search.interface';
import { SearchPagination } from '@/components/search-pagination';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

function showMessage(message: string) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <span className="text-muted">{message}</span>
    </div>
  );
}

export default async function Busqueda({
  searchParams,
}: {
  searchParams: Promise<{ q: string; page: string }>;
}) {
  const { q = '', page = '1' } = await searchParams;
  const resultados = await Search(q, Number(page));
  const data = resultados.data;

  if (resultados.error) {
    // Manejo de error
    return showMessage(resultados.message);
  } else if (resultados.totalPages === 0) {
    // No hay resultados
    return showMessage('No se encontraron resultados');
  } else if (resultados.page > resultados.totalPages) {
    // Redirigir a la última página si la página solicitada es mayor que el total de páginas
    const params = new URLSearchParams({ q, page: resultados.totalPages.toString() });
    if (q) {
      params.set('q', q);
    }
    params.set('page', resultados.totalPages.toString());
    redirect(`/busqueda?${params.toString()}`);
  } else if (resultados.data.length === 0) {
    // No hay resultados en la página actual, pero hay resultados en otras páginas
    return (
      <>
        {showMessage('No se encontraron resultados')}
        <Suspense fallback={null}>
          <SearchPagination page={Number(page)} totalPages={resultados.totalPages} />
        </Suspense>
      </>
    );
  }

  // Renderizar resultados de búsqueda
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:px-10 md:py-7">
      <h1 className="text-xl sm:text-2xl font-bold">Resultados de búsqueda</h1>
      {data.map((resultado: SearchResult) => {
        return (
          <SearchResultCard
            key={`${resultado.type}-${resultado.id}`}
            resultado={resultado}
          />
        );
      })}
      <Suspense fallback={null}>
        <SearchPagination page={Number(page)} totalPages={resultados.totalPages} />
      </Suspense>
    </div>
  );
}
