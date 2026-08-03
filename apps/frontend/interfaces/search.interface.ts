export interface SearchResult {
  type: 'course' | 'class';
  id: number;
  secondary_id: number;
  title: string;
  subtitle: string;
  image: string;
  meta: string;
  description: string;
}
