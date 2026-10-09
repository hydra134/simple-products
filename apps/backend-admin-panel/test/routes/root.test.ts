import { test } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../helper.js';

void test('default root route', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/',
  });
  assert.equal(res.statusCode, 200);
  assert.deepStrictEqual(res.json<unknown>(), { root: true });
});
