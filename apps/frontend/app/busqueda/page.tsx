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
    <>
      <h1>Resultados de búsqueda</h1>
      {data.map((resultado: SearchResult) => {
        return (
          <div key={resultado.id}>
            <h1>{resultado.title}</h1>
            <p>{resultado.subtitle}</p>
          </div>
        );
      })}
    </>
  );
}
