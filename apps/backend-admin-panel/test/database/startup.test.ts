import { expect, test } from 'vitest';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import app from '../../src/app.js';

test('application awaits the initial database check before registering routes', async (t) => {
  const server = Fastify();
  let checked = false;
  const databasePlugin = fp(async (fastify) => {
    fastify.decorate('checkDatabase', async () => {
      checked = true;
    });
  });
  t.onTestFinished(async () => server.close());

  await server.register(app, { databasePlugin });
  await server.ready();

  expect(checked).toBe(true);
  expect((await server.inject('/health/live')).statusCode).toBe(200);
});

test('application fails startup with a sanitized message when the initial database check fails', async () => {
  const server = Fastify();
  const databasePlugin = fp(async (fastify) => {
    fastify.decorate('checkDatabase', async () => {
      throw new Error('password=private-secret');
    });
  });

  await expect(async () => {
    await server.register(app, { databasePlugin });
    await server.ready();
  }).rejects.toThrow(new Error('Database connection check failed during startup'));
  await server.close().catch(() => undefined);
});
