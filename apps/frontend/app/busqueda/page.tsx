import { SearchResult } from '@/interfaces/search.interface';
const API_URL = process.env.API_URL || 'http://localhost:3001';
async function getBusqueda(busqueda: string) {
  {
    const response = await fetch(`${API_URL}/search?q=${busqueda}`);
    const resultados = await response.json();
    return resultados;
  }
}

export default async function Busqueda({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const { busqueda = '' } = await searchParams;
  const resultados = await getBusqueda(busqueda);
  const data = resultados.data;
  return (
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
