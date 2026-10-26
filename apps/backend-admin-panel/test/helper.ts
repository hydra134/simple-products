import { type TestContext } from 'vitest';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import app from '../src/app.js';

export async function build(t: TestContext, checkDatabase: () => Promise<void> = async () => {}) {
  const server = Fastify();
  t.onTestFinished(async () => server.close());
  const databasePlugin = fp(async (fastify) => {
    fastify.decorate('checkDatabase', checkDatabase);
  });
  await server.register(app, { databasePlugin });
  await server.ready();
  return server;
}
