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

/** Clears the client-only display name; session cookies belong to auth handlers. */
export function clearUserDisplayName() {
  if (typeof window !== 'undefined') localStorage.removeItem('user_name');
}
