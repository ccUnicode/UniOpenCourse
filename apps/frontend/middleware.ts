import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Interceptar únicamente rutas bajo /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value;
    const role = request.cookies.get('user_role')?.value;

    const isLoginPage = pathname === '/admin/login';

    // Si intenta entrar a /admin/login estando ya autenticado como ADMIN
    if (isLoginPage && token && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/cursos', request.url));
    }

    // Si NO es la página de login y no tiene token ni rol ADMIN, redirigir al login
    if (!isLoginPage && (!token || role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

