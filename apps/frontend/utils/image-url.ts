const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getStorageImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_URL}/storage/${imagePath}`;
}
