export function setAuthCookies(token: string, role: string) {
  if (typeof window !== 'undefined') {
    // Expire in 1 day (86400 seconds)
    document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
  }
}

export function clearAuthCookies() {
  if (typeof window !== 'undefined') {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }
}
