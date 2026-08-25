export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('user_name');
  }
}

export function saveUserDisplayName(name: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('user_name', name);
  }
}

export function getUserDisplayName() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('user_name') || 'Estudiante';
  }
  return 'Estudiante';
}
