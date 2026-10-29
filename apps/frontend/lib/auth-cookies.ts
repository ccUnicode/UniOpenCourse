/** Logs out the current user and clears the stored display name */
export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_name');
  }
}

/** Persists the user's display name across browser tabs */
export function saveUserDisplayName(name: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_name', name);
  }
}

/** Retrieves the stored display name or falls back to 'Estudiante' */
export function getUserDisplayName() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_name') || 'Estudiante';
  }
  return 'Estudiante';
}
