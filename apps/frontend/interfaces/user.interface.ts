/** Safe profile fields returned by the administrative user list. */
export interface AdminUser {
  user_id: number;
  name: string;
  last_name: string;
  username: string;
  email: string;
  email_verified: boolean;
  register_date: string;
  role: { role_id: number; role_name: string };
}

export interface AdminUsersPage {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Profile and visit history returned by GET /admin/users/:id. */
export interface AdminUserDetail extends AdminUser {
  email_verified_at: string | null;
  visited_courses: {
    course_id: number;
    start_date: string;
    last_visit_date: string;
    course: {
      course_id: number;
      name: string;
      course_code: string;
      url_image: string;
      description: string;
      teacher: { name: string; last_name: string };
    };
  }[];
}
