import { NextResponse } from 'next/server';
import { accessTokenCookieOptions, getBackendUrl } from '@/lib/auth-cookie';

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getBackendUrl()}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const res = NextResponse.json({ user: data.user });
  res.cookies.set('access_token', data.access_token, accessTokenCookieOptions);
  return res;
}
