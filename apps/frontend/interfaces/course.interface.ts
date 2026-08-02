export interface CourseDashboard {
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
