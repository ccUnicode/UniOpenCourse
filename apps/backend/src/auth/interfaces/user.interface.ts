export interface User {
  user_id: number;
  email: string;
  name: string;
  last_name: string;
  username: string;
  password: string;
  role_id: number;
  role: {
    role_id: number;
    role_name: string;
  };
}
