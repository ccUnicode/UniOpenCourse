import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { SignJWT } from 'jose';
import { createModules } from './load-module.mjs';

const req = createRequire(import.meta.url);
const { NextRequest } = req('next/server');

const TEST_SECRET = 'test-jwt-secret-key-32-chars-long!';

/** Generates a signed JWT token for testing */
async function generateToken(payload, secret = TEST_SECRET, expiresIn = '1h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}

test('getGoogleAuthUrl returns the configured API URL endpoint', () => {
  const state = createModules({
    env: { NEXT_PUBLIC_API_URL: 'https://api.uniopencourse.test' },
  });
  const auth = state.load('services/auth.service');
  assert.equal(auth.getGoogleAuthUrl(), 'https://api.uniopencourse.test/auth/google');
});

test('getGoogleAuthUrl falls back to localhost:3001 when NEXT_PUBLIC_API_URL is not set', () => {
  const state = createModules({
    env: { NEXT_PUBLIC_API_URL: '' },
  });
  const auth = state.load('services/auth.service');
  assert.equal(auth.getGoogleAuthUrl(), 'http://localhost:3001/auth/google');
});

test('callback redirects to login with google_auth_failed when error is present', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const request = new NextRequest(
    'http://localhost:3000/auth/google/callback?error=access_denied',
  );
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/login?error=google_auth_failed',
  );
  assert.equal(response.cookies.get('access_token'), undefined);
});

test('callback redirects to login with google_auth_failed when token is missing', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const request = new NextRequest('http://localhost:3000/auth/google/callback');
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/login?error=google_auth_failed',
  );
  assert.equal(response.cookies.get('access_token'), undefined);
});

test('callback redirects to login with invalid_token when token is tampered or signature fails', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  // Token signed with a different secret
  const foreignToken = await generateToken(
    { sub: 1, email: 'attacker@example.test', role: 'USER' },
    'wrong-secret-key-12345678901234',
  );

  const request = new NextRequest(
    `http://localhost:3000/auth/google/callback?token=${encodeURIComponent(foreignToken)}`,
  );
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/login?error=invalid_token',
  );
  assert.equal(response.cookies.get('access_token'), undefined);
});

test('callback verifies JWT, sets access_token cookie, and redirects student to /dashboard', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const token = await generateToken({
    sub: 42,
    email: 'estudiante@uni.edu.pe',
    role: 'USER',
  });

  const request = new NextRequest(
    `http://localhost:3000/auth/google/callback?token=${encodeURIComponent(token)}`,
  );
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/dashboard',
  );

  const cookie = response.cookies.get('access_token');
  assert.ok(cookie, 'La cookie access_token debe ser emitida');
  assert.equal(cookie.value, token);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, 'lax');
  assert.equal(cookie.path, '/');
  assert.equal(cookie.maxAge, 86400);
});

test('callback redirects admin user to /admin/cursos', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const adminToken = await generateToken({
    sub: 1,
    email: 'admin@uniopencourse.com',
    role: 'ADMIN',
  });

  const request = new NextRequest(
    `http://localhost:3000/auth/google/callback?token=${encodeURIComponent(adminToken)}`,
  );
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/admin/cursos',
  );
  assert.equal(response.cookies.get('access_token')?.value, adminToken);
});

test('callback respects safe internal return_to destination', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const token = await generateToken({
    sub: 42,
    email: 'estudiante@uni.edu.pe',
    role: 'USER',
  });

  const request = new NextRequest(
    `http://localhost:3000/auth/google/callback?token=${encodeURIComponent(token)}&return_to=/cursos`,
  );
  const response = await route.GET(request);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get('location'),
    'http://localhost:3000/cursos',
  );
});

test('callback prevents open redirects and falls back to /dashboard safely', async () => {
  const state = createModules({ env: { JWT_SECRET: TEST_SECRET } });
  const route = state.load('app/auth/google/callback/route');

  const token = await generateToken({
    sub: 42,
    email: 'estudiante@uni.edu.pe',
    role: 'USER',
  });

  // Intentos de open redirect
  const maliciousUrls = [
    'http://localhost:3000/auth/google/callback?token=' + encodeURIComponent(token) + '&return_to=//evil.com',
    'http://localhost:3000/auth/google/callback?token=' + encodeURIComponent(token) + '&return_to=https://attacker.com',
  ];

  for (const url of maliciousUrls) {
    const request = new NextRequest(url);
    const response = await route.GET(request);
    assert.equal(
      response.headers.get('location'),
      'http://localhost:3000/dashboard',
      `Debe rechazar ${url} y redirigir a /dashboard`,
    );
  }
});
