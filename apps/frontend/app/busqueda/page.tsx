const API_URL = process.env.API_URL || 'http://localhost:3001';
async function getBusqueda(busqueda: string) {
  {
    let response = await fetch(`${API_URL}/search?q=${busqueda}`);
    let resultados = await response.json();
    return resultados;
  }
}

export default async function Busqueda({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const { busqueda = '' } = await searchParams;
  let resultados = await getBusqueda(busqueda);
  let data = resultados.data;
  return (
    <>
      <h1>Resultados de búsqueda</h1>
      {data.map((resultado: any) => {
        return <h1>resultado.title</h1>;
      })}
    </>
  );
}
