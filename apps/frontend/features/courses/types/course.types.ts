export interface Teacher {
  name: string;
  last_name: string;
}

export interface Course {
  id?: string | number;
  name: string;
  course_code: string;
  description: string;
  url_image: string;
  teacher?: Teacher;
  statusCode?: number;
  error?: string;
}

export interface Class {
  class_id?: string | number;
  title: string;
  description: string;
  url_youtube: string;
  statusCode?: number;
  error?: string;
}

export interface Material {
  material_id: string | number;
  filename: string;
}
