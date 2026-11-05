import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createModules, frontendRoot } from './load-module.mjs';

test('auth works without an existing session and retains backend error responses', async () => {
  const state = createModules({
    respond: () => Response.json({ code: 'EMAIL_NOT_VERIFIED' }, { status: 403 }),
  });
  const auth = state.load('services/auth.service');
  const response = await auth.login({ email: 'user@example.test', password: 'secret' });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, 'EMAIL_NOT_VERIFIED');
  assert.equal(state.calls[0].url, '/api/auth/login');
  assert.equal(state.calls[0].options.credentials, 'include');
  assert.equal(state.calls[0].options.headers.get('Content-Type'), 'application/json');
  assert.equal(JSON.parse(state.calls[0].options.body).password, 'secret');
});

test('all auth actions use their existing handlers instead of the protected proxy', async () => {
  const state = createModules();
  const auth = state.load('services/auth.service');
  await auth.getSession();
  await auth.loginAdmin({ email: 'admin@example.test', password: 'secret' });
  await auth.registerAccount({
    email: 'user@example.test',
    password: 'secret',
    name: 'User',
    last_name: 'Local',
    username: 'local',
  });
  await auth.verifyEmail('single-use-token');
  await auth.resendVerification('user@example.test');
  assert.deepEqual(
    state.calls.map((c) => c.url),
    [
      '/api/auth/session',
      '/api/auth/admin/login',
      '/api/auth/register',
      '/api/auth/verify-email',
      '/api/auth/resend-verification',
    ],
  );
  assert.equal(JSON.parse(state.calls[3].options.body).token, 'single-use-token');
});

test('logout clears the stored display name only on success', async () => {
  const state = createModules();
  state.storage.set('user_name', 'User');
  await state.load('services/auth.service').logout();
  assert.equal(state.storage.has('user_name'), false);
  assert.equal(state.calls[0].url, '/api/auth/logout');
  const failed = createModules({ respond: () => Response.json({}, { status: 500 }) });
  failed.storage.set('user_name', 'User');
  await assert.rejects(failed.load('services/auth.service').logout(), /cerrar la sesión/);
  assert.equal(failed.storage.get('user_name'), 'User');
});

test('public catalog queries are anonymous and encode search terms correctly', async () => {
  const state = createModules();
  await state.load('services/courses.service').getCourseData('álgebra & page=99', 2);
  const call = state.calls[0],
    url = new URL(call.url);
  assert.equal(url.origin, 'https://public.example.test');
  assert.equal(url.searchParams.get('q'), 'álgebra & page=99');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(call.options.headers.has('Authorization'), false);
  assert.equal(call.options.credentials, undefined);
});

test('server public requests and backend forwarding use absolute internal URLs', async () => {
  const state = createModules({
    server: true,
    env: { API_URL: 'http://backend.internal:3001/' },
  });
  await state.load('services/courses.service').getCourse('42');
  await state.load('services/backend.service').forwardBackendRequest('auth/login', {
    method: 'POST',
    body: '{}',
    headers: { Authorization: 'Bearer server-token' },
  });
  assert.equal(state.calls[0].url, 'http://backend.internal:3001/courses/42');
  assert.equal(state.calls[1].url, 'http://backend.internal:3001/auth/login');
  assert.equal(
    state.calls[1].options.headers.get('Authorization'),
    'Bearer server-token',
  );
  assert.throws(
    () =>
      createModules()
        .load('services/backend.service')
        .forwardBackendRequest('auth/login'),
    /only available on the server/,
  );
});

test('authenticated calls preserve headers and cancellation without mutating the caller', async () => {
  const state = createModules();
  const headers = new Headers({ 'X-Request-ID': 'request-1' });
  const controller = new AbortController();
  await state.load('lib/api-client').apiFetch('/courses/42/visit', {
    method: 'POST',
    body: '{}',
    headers,
    signal: controller.signal,
  });
  const call = state.calls[0];
  assert.equal(call.url, '/api/proxy/courses/42/visit');
  assert.equal(call.options.credentials, 'include');
  assert.equal(call.options.headers.get('X-Request-ID'), 'request-1');
  assert.equal(call.options.signal, controller.signal);
  assert.equal(headers.has('Content-Type'), false);
  assert.equal('target' in call.options, false);
});

test('material file uploads retain FormData and let the browser set the multipart boundary', async () => {
  const state = createModules();
  const blob = new Blob(['local test'], { type: 'application/pdf' });
  await state.load('services/materials.service').createFileMaterial(3, 'Reference', blob);
  const call = state.calls[0];
  assert.equal(call.url, '/api/proxy/admin/materials/file');
  assert(call.options.body instanceof FormData);
  assert.equal(call.options.body.get('class_id'), '3');
  assert.equal(call.options.body.get('filename'), 'Reference');
  assert.equal(await call.options.body.get('file').text(), 'local test');
  assert.equal(call.options.headers.has('Content-Type'), false);
});

test('material validation errors retain field-level messages', async () => {
  const state = createModules({
    respond: () =>
      Response.json(
        { message: ['El enlace debe ser HTTPS', 'Nombre requerido'] },
        { status: 400 },
      ),
  });
  await assert.rejects(
    state
      .load('services/materials.service')
      .createLinkMaterial(3, 'Reference', 'http://invalid.test'),
    /El enlace debe ser HTTPS Nombre requerido/,
  );
});

test('missing public resources retain their not-found contract and do not require login', async () => {
  const state = createModules({
    server: true,
    respond: () => Response.json({}, { status: 404 }),
  });
  const materials = await state.load('services/materials.service').getMaterialData('99');
  const course = await state.load('services/courses.service').getCourse('99');
  assert.equal(materials.statusCode, 404);
  assert.equal(course.error, 'Not Found');
  assert.equal(state.calls[0].url, 'https://public.example.test/classes/99/materials');
});

test('class video transformation is separate from networking', async () => {
  const state = createModules({
    respond: () => Response.json({ url_youtube: 'https://youtu.be/abcdefghijk' }),
  });
  const result = await state.load('services/classes.service').getClassData('3');
  assert.equal(result.url_youtube, 'https://www.youtube.com/embed/abcdefghijk');
  const before = state.calls.length;
  assert.equal(state.load('utils/video-url').getEmbedUrl('invalid-url'), '');
  state.load('utils/admin-date').formatAdminDate('invalid-date');
  state.load('lib/user-session').saveUserDisplayName('User');
  assert.equal(state.calls.length, before);
});

test('selector pagination collects every page and preserves existing filters', async () => {
  const state = createModules({
    respond: (url) => {
      const page = Number(new URL(url, 'http://localhost').searchParams.get('page'));
      return Response.json({ data: [{ id: page }], totalPages: 2 });
    },
  });
  const data = await state
    .load('services/general.service')
    .fetchAllPages('admin/classes?course_id=3', 50);
  assert.equal(data.length, 2);
  assert.equal(state.calls.length, 2);
  assert.equal(
    state.calls[1].url,
    '/api/proxy/admin/classes?course_id=3&page=2&limit=50',
  );
});

test('raw fetch stays in api-client and UI delegates HTTP calls to services', () => {
  function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const file = path.join(dir, e.name);
      return e.isDirectory() && !['node_modules', '.next', 'tests'].includes(e.name)
        ? walk(file)
        : e.isFile() && /\.tsx?$/.test(file)
          ? [file]
          : [];
    });
  }
  for (const file of walk(frontendRoot)) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const relative = path.relative(frontendRoot, file).replaceAll('\\', '/');
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const name = node.expression.getText(source);
        if (name === 'fetch')
          assert.equal(
            relative,
            'lib/api-client.ts',
            `${relative} bypasses the HTTP client`,
          );
        if (name === 'apiFetch')
          assert(
            relative === 'lib/api-client.ts' || relative.startsWith('services/'),
            `${relative} bypasses domain services`,
          );
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
});
