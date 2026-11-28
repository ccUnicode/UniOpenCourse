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
