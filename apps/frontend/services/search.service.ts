const baseUrl = process.env.API_URL || 'http://localhost:3001';

export function formatType(type: string) {
  switch (type) {
    case 'course':
      return 'Curso';
    case 'class':
      return 'Clase';
    default:
      return type;
  }
}

export async function Search(busqueda: string, page: number) {
  {
    const params = new URLSearchParams({ q: busqueda, page: page.toString() });
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
