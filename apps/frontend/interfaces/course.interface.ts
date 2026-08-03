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
