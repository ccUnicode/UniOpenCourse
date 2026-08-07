import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-cookie';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout exitoso' });
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
