import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-cookie';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));

  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
