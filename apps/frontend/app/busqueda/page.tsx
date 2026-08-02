import SearchResultCard from '@/components/search-result-card';
import { SearchResult } from '@/interfaces/search.interface';
import { Search } from '@/services/search.service';

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
  searchParams: Promise<{ q: string }>;
}) {
  const { q = '' } = await searchParams;
  const resultados = await Search(q);
  const data = resultados.data;
  return resultados.error ? (
    showMessage(resultados.message)
  ) : resultados.data.length === 0 ? (
    showMessage('No se encontraron resultados')
  ) : (
    <div className="flex-1 flex flex-col gap-4 px-10 py-7">
      <h1 className="text-2xl font-bold">Resultados de búsqueda</h1>
      {data.map((resultado: SearchResult) => {
        return (
          <SearchResultCard
            key={`${resultado.secondary_id}-${resultado.id}`}
            resultado={resultado}
          />
        );
      })}
    </div>
  );
}
