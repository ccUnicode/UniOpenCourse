import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo interceptamos si la ruta empieza con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Si van al login viejo de admin, ignoramos
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Por ahora deshabilitamos la verificación de autenticación en el middleware
    // La autenticación se maneja en el cliente con JWT tokens en localStorage
    // TODO: Implementar verificación JWT en el middleware si es necesario
    
    // Comentamos temporalmente la verificación de cookie
    // const role = request.cookies.get('role')?.value;
    // if (role !== 'admin') {
    //   const loginUrl = new URL('/login', request.url);
    //   return NextResponse.redirect(loginUrl);
    // }
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar a todas las rutas bajo /admin
  matcher: '/admin/:path*',
};
