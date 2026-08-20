export interface CourseDashboardAdmin {
  course_id: number;
  name: string;
  course_code: string;
  description?: string;
}
export interface Course {
  course_id: number;
  name: string;
  course_code: string;
  description: string;
  url_image: string;
  teacher: {
    name: string;
    last_name: string;
  };
}
export interface CourseDashboard extends Course {
  start_date: Date;
  last_visit_date: Date;
}

export type CourseStatus = 'published' | 'draft' | 'archived';

export interface CreateCourse {
  course_id: number;
  name: string;
  course_code: string;
  teacher_name?: string;
  teacher?: { name: string; last_name: string };
  description: string;
  file?: string;
  status?: CourseStatus;
  course_creation_date?: string;
  update_date?: string;
}

export interface CreateCoursePayload {
  name: string;
  course_code: string;
  description: string;
  teacher_name?: string;
  teacher_last_name?: string;
  file: File;
}
