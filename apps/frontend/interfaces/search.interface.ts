export interface SearchResult {
  type: 'course' | 'class';
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  meta: string;
}
