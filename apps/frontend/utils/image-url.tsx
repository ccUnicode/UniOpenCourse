const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getStorageImageUrl(filename: string) {
  return `${API_URL}/storage/${filename}`;
}
