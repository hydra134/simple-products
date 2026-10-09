import { test } from 'node:test';
import * as assert from 'node:assert';
import Fastify from 'fastify';
import Support from '../../src/plugins/support.js';

void test('support works standalone', async (t) => {
  const fastify = Fastify();
  t.after(async () => fastify.close());
  await fastify.register(Support);
  await fastify.ready();

  assert.equal(fastify.someSupport(), 'hugs');
});
