import { apiFetch } from '@/lib/api-client';
import { clearUserDisplayName } from '@/lib/user-session';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends LoginCredentials {
  name: string;
  last_name: string;
  username: string;
}

/** Reads session state through the HttpOnly-cookie handler. */
export function getSession() {
  return apiFetch('session', { target: 'auth' });
}

/** Logs in a student without requiring an existing session. */
export function login(credentials: LoginCredentials) {
  return apiFetch('login', {
    target: 'auth',
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/** Logs in an administrator through its existing Next.js handler. */
export function loginAdmin(credentials: LoginCredentials) {
  return apiFetch('admin/login', {
    target: 'auth',
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/** Registers an account and preserves verification/error responses. */
export function registerAccount(data: RegistrationData) {
  return apiFetch('register', {
    target: 'auth',
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Redeems the single-use email verification token. */
export function verifyEmail(token: string) {
  return apiFetch('verify-email', {
    target: 'auth',
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/** Requests another verification email, including cooldown/error responses. */
export function resendVerification(email: string) {
  return apiFetch('resend-verification', {
    target: 'auth',
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Clears the display name only after the server has closed the session. */
export async function logout() {
  const response = await apiFetch('logout', { target: 'auth', method: 'POST' });
  if (!response.ok) throw new Error('No se pudo cerrar la sesión');
  clearUserDisplayName();
}
