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

export async function Search(busqueda: string) {
  {
    console.log(`${baseUrl}/search?q=${busqueda}`);
    const response = await fetch(`${baseUrl}/search?q=${busqueda}`);
    const resultados = await response.json();
    console.log(resultados);
    if (resultados.error) {
      return { data: [], error: resultados.error, message: resultados.message };
    }
    return resultados;
  }
}
