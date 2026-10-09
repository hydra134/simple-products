import { type TestContext } from 'node:test';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import app from '../src/app.js';

export async function build(t: TestContext) {
  const server = Fastify();
  t.after(async () => server.close());
  await server.register(fp(app));
  await server.ready();
  return server;
}
