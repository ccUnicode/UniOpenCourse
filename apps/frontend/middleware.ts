import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo interceptamos si la ruta empieza con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Si van al login viejo de admin, ignoramos
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Obtenemos la cookie mock que definimos en el login
    const role = request.cookies.get('role')?.value;

    // Si no es admin, lo redirigimos al login principal para proteger el dashboard
    if (role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar a todas las rutas bajo /admin
  matcher: '/admin/:path*',
};
