const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export function getStorageImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Si ya viene con el prefijo /storage/ (guardado relativo sin BACKEND_URL)
  if (normalizedPath.startsWith('/storage/')) {
    return `${API_URL}${normalizedPath}`;
  }

  // Soporte para nombres antiguos (legacy) que no incluían /storage/
  return `${API_URL}/storage${normalizedPath}`;
}
