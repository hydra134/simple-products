import { expect, test } from 'vitest';
import { build } from '../helper.js';

test('default root route', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/',
  });
  expect(res.statusCode).toBe(200);
  expect(res.json<unknown>()).toStrictEqual({ root: true });
});

test('liveness does not query PostgreSQL', async (t) => {
  let queryCount = 0;
  const app = await build(t, async () => {
    queryCount += 1;
  });

  queryCount = 0;
  const res = await app.inject({ url: '/health/live' });

  expect(res.statusCode).toBe(200);
  expect(res.json<unknown>()).toStrictEqual({ status: 'ok' });
  expect(queryCount).toBe(0);
});

test('readiness returns ready when PostgreSQL responds', async (t) => {
  const app = await build(t);

  const res = await app.inject({ url: '/health/ready' });

  expect(res.statusCode).toBe(200);
  expect(res.json<unknown>()).toStrictEqual({ status: 'ready' });
});

test('readiness returns a sanitized unavailable response when PostgreSQL fails', async (t) => {
  let checks = 0;
  const app = await build(t, async () => {
    checks += 1;
    if (checks > 1) {
      throw new Error('database password must not escape');
    }
  });

  const res = await app.inject({ url: '/health/ready' });

  expect(res.statusCode).toBe(503);
  expect(res.json<unknown>()).toStrictEqual({ status: 'not_ready' });
  expect(res.payload.includes('database password')).toBe(false);
});

test('readiness recovers after PostgreSQL becomes available again', async (t) => {
  let available = true;
  const app = await build(t, async () => {
    if (!available) {
      throw new Error('database unavailable');
    }
  });

  available = false;
  expect((await app.inject('/health/ready')).statusCode).toBe(503);

  available = true;
  const recovered = await app.inject('/health/ready');
  expect(recovered.statusCode).toBe(200);
  expect(recovered.json<unknown>()).toStrictEqual({ status: 'ready' });
});
