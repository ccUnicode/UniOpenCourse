import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from '@/lib/auth-cookie';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * Route handler de Next.js que procesa el retorno de Google OAuth desde el backend.
 * Extrae el JWT del query param `?token=...`, valida su firma criptográfica y vigencia,
 * persiste la cookie HttpOnly `access_token` y redirige al panel correspondiente.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  // Si Google o el backend reportaron error, o si la petición no incluye token
  if (error || !token) {
    return NextResponse.redirect(
      new URL('/login?error=google_auth_failed', request.url),
    );
  }

  try {
    // Validamos la firma y vigencia del JWT con el secreto compartido
    const payload = await verifyAccessToken(token);

    // Permitir redirección a una ruta interna relativa segura si se especificó
    const returnTo = searchParams.get('return_to');
    const isValidRelative =
      returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//');

    const targetPath = isValidRelative
      ? returnTo
      : payload.role === 'ADMIN'
        ? '/admin/cursos'
        : '/dashboard';

    const response = NextResponse.redirect(new URL(targetPath, request.url));

    // Persistimos la cookie HttpOnly de sesión de forma idéntica al login tradicional
    response.cookies.set(ACCESS_TOKEN_COOKIE, token, accessTokenCookieOptions);

    return response;
  } catch {
    // Token manipulado, con firma inválida o expirado
    return NextResponse.redirect(
      new URL('/login?error=invalid_token', request.url),
    );
  }
}
