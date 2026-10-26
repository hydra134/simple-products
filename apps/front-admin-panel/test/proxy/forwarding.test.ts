import { expect, test } from 'vitest';
import { proxyRequest } from '../../src/lib/api-proxy.server';

function inputUrl(input: Parameters<typeof fetch>[0]) {
  return input instanceof Request ? input.url : input.toString();
}

test('forwards method, query, binary body and safe headers; preserves upstream response', async () => {
  const payload = new Uint8Array([0, 128, 255]);
  const request = new Request('http://frontend/api/items?tag=a&tag=b', {
    method: 'POST',
    body: payload,
    headers: {
      'content-type': 'application/octet-stream',
      authorization: 'Bearer local-test',
      connection: 'x-private, keep-alive',
      'x-private': 'remove',
      'keep-alive': 'timeout=10',
    },
  });
  const fetcher: typeof fetch = async (input, init) => {
    expect(inputUrl(input)).toBe('http://backend:3001/items?tag=a&tag=b');
    expect(init?.method).toBe('POST');
    const forwarded = new Request(input, init);
    expect(new Uint8Array(await forwarded.arrayBuffer())).toStrictEqual(payload);
    expect(forwarded.headers.get('authorization')).toBe('Bearer local-test');
    expect(forwarded.headers.get('content-type')).toBe('application/octet-stream');
    expect(forwarded.headers.get('x-private')).toBe(null);
    expect(forwarded.headers.get('keep-alive')).toBe(null);
    const headers = new Headers({
      'content-type': 'application/octet-stream',
      connection: 'x-upstream',
      'x-upstream': 'remove',
    });
    headers.append('set-cookie', 'a=1; HttpOnly');
    headers.append('set-cookie', 'b=2; HttpOnly');
    return new Response(payload, { status: 201, headers });
  };
  const result = await proxyRequest(request, ['items'], 'http://backend:3001', fetcher);
  expect(result.status).toBe(201);
  expect(new Uint8Array(await result.arrayBuffer())).toStrictEqual(payload);
  expect(result.headers.get('x-upstream')).toBe(null);
  expect(result.headers.get('content-type')).toBe('application/octet-stream');
  expect(result.headers.getSetCookie().length).toBe(2);
});

test('supports GET, HEAD, PUT, PATCH, DELETE and OPTIONS', async () => {
  for (const method of ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const fetcher: typeof fetch = async (_input, init) => {
      expect(init?.method).toBe(method);
      return new Response(null, { status: 204 });
    };
    const result = await proxyRequest(
      new Request('http://frontend/api/items', { method }),
      ['items'],
      'http://backend:3001',
      fetcher,
    );
    expect(result.status).toBe(204);
    expect(await result.text()).toBe('');
  }
});

test('upstream redirects stay on the frontend proxy and are not followed', async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    expect(init?.redirect).toBe('manual');
    return new Response(null, { status: 302, headers: { location: '/login?next=items' } });
  };
  const result = await proxyRequest(
    new Request('http://frontend/api/items'),
    ['items'],
    'http://backend:3001',
    fetcher,
  );
  expect(result.status).toBe(302);
  expect(result.headers.get('location')).toBe('/api/login?next=items');
});

test('configured origin cannot be replaced by a user-supplied path', async () => {
  const fetcher: typeof fetch = async (input) => {
    expect(new URL(inputUrl(input)).origin).toBe('http://backend:3001');
    return Response.json({ ok: true });
  };
  const result = await proxyRequest(
    new Request('http://frontend/api/anything'),
    ['https://attacker.invalid'],
    'http://backend:3001',
    fetcher,
  );
  expect(result.status).toBe(200);
});

test('unavailable upstream and invalid configuration return sanitized 502', async () => {
  const failingFetch: typeof fetch = async () => {
    throw new Error('sensitive upstream details');
  };
  for (const origin of [
    'http://backend:3001',
    'file:///etc/passwd',
    'http://user:secret@backend',
  ]) {
    const result = await proxyRequest(
      new Request('http://frontend/api/health/ready'),
      ['health', 'ready'],
      origin,
      failingFetch,
    );
    expect(result.status).toBe(502);
    expect(await result.json()).toStrictEqual({ error: 'Bad Gateway' });
  }
});
