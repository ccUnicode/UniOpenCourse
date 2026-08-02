import { SearchResult } from '@/interfaces/search.interface';
import { Search } from '@/services/search.service';

export default async function Busqueda({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q = '' } = await searchParams;
  const resultados = await Search(q);
  const data = resultados.data;
  return (
    <>
      {resultados.error ? <span>{resultados.message}</span> : null}
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
