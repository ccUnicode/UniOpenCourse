const baseUrl = process.env.API_URL || 'http://localhost:3001';
export async function Search(busqueda: string) {
  {
    const params = new URLSearchParams({ q: busqueda });
    const url = `${baseUrl}/search?${params.toString()}`;
    const response = await fetch(url);
    const resultados = await response.json();
    console.log(resultados);
    if (resultados.error) {
      return { data: [], error: resultados.error, message: resultados.message };
    }
    return resultados;
  }
}
