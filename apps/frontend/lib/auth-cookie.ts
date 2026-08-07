export const ACCESS_TOKEN_COOKIE = 'access_token';
export const COOKIE_MAX_AGE = 60 * 60 * 24;

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE,
};

export function getBackendUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
