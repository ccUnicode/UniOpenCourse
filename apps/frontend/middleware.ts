import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

/** Protects /admin and /dashboard routes by validating the JWT cookie and user role */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
      if (token) {
        try {
          const payload = await verifyAccessToken(token);
          if (payload.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/cursos', request.url));
          }
        } catch {
          // Token inválido: permitir ver el login
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const payload = await verifyAccessToken(token);
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = await verifyAccessToken(token);
      if (payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/cursos', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
