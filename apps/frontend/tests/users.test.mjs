import test from 'node:test';
import assert from 'node:assert/strict';
import { createModules } from './load-module.mjs';

test('user list uses the authenticated proxy and returns all pagination metadata', async () => {
  const payload = {
    data: [{ user_id: 7, name: 'Gabriel', role: { role_name: 'USER' } }],
    total: 31,
    page: 2,
    limit: 15,
    totalPages: 3,
  };
  const state = createModules({ respond: () => Response.json(payload) });
  const controller = new AbortController();
  const result = await state.load('services/users.service').getAdminUsers({
    search: '  álgebra & page=99  ',
    page: 2,
    limit: 15,
    signal: controller.signal,
  });
  assert.deepEqual(result, payload);
  const call = state.calls[0];
  const url = new URL(call.url, 'http://localhost');
  assert.equal(url.pathname, '/api/proxy/admin/users');
  assert.equal(url.searchParams.get('search'), 'álgebra & page=99');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('limit'), '15');
  assert.equal(call.options.credentials, 'include');
  assert.equal(call.options.signal, controller.signal);
  assert.equal(call.options.cache, 'no-store');
});

test('user list defaults to ten records and preserves an empty result', async () => {
  const payload = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  const state = createModules({ respond: () => Response.json(payload) });
  assert.deepEqual(await state.load('services/users.service').getAdminUsers(), payload);
  const query = new URL(state.calls[0].url, 'http://localhost').searchParams;
  assert.equal(query.get('page'), '1');
  assert.equal(query.get('limit'), '10');
  assert.equal(query.get('search'), '');
});

test('platform total can be requested independently of the active search', async () => {
  const state = createModules({ respond: () => Response.json({ total: 31 }) });
  const result = await state.load('services/users.service').getAdminUsers({ limit: 1 });
  assert.equal(result.total, 31);
  const query = new URL(state.calls[0].url, 'http://localhost').searchParams;
  assert.equal(query.get('limit'), '1');
  assert.equal(query.get('search'), '');
});

test('user list reports session and permission failures instead of empty data', async () => {
  for (const [status, message] of [
    [401, /sesión ha expirado/],
    [403, /permisos/],
  ]) {
    const state = createModules({ respond: () => Response.json({}, { status }) });
    await assert.rejects(state.load('services/users.service').getAdminUsers(), message);
  }
});

test('user list retains backend errors and propagates network cancellation', async () => {
  const state = createModules({
    respond: () => Response.json({ message: ['Invalid query'] }, { status: 400 }),
  });
  await assert.rejects(
    state.load('services/users.service').getAdminUsers(),
    /Invalid query/,
  );
  const canceled = createModules({
    respond: () => {
      throw new Error('Aborted');
    },
  });
  await assert.rejects(
    canceled.load('services/users.service').getAdminUsers(),
    /Aborted/,
  );
});
