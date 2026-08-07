import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const payload = await verifyAccessToken(token);
    return NextResponse.json({
      authenticated: true,
      role: payload.role,
      email: payload.email,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
