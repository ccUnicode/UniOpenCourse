import type { CreateCourse } from './course.interface';

export interface CourseOption {
  course_id: number;
  name: string;
  course_code: string;
}

export interface AdminCourse extends CreateCourse {
  teacher_last_name?: string;
}

export interface ClassOption {
  class_id: number;
  course_id?: number;
  title: string;
  course?: { name: string; course_code: string };
}

export interface AdminClass extends ClassOption {
  class_id: number;
  course_id: number;
  title: string;
  description: string;
  url_youtube?: string;
  class_creation_date?: string;
  materials?: AdminMaterial[];
}

export type MaterialType = 'file' | 'link' | 'reference';

export interface AdminMaterial {
  material_id: number;
  class_id: number;
  material_type: MaterialType;
  filename: string;
  url_link?: string;
  written_reference?: string;
  material_creation_date: string;
  class?: { title: string; course?: { name: string; course_code: string } };
}

export interface Paginated<T> {
  data: T[];
  total: number;
  totalPages: number;
}
