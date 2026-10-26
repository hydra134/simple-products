const hopByHopHeaders = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

function filteredHeaders(source: Headers) {
  const headers = new Headers(source);
  const nominated = (headers.get('connection') ?? '').split(',');
  for (const name of [...hopByHopHeaders, ...nominated]) {
    if (name.trim()) headers.delete(name.trim());
  }
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

export async function proxyRequest(
  request: Request,
  segments: string[],
  origin = process.env.API_INTERNAL_URL,
  fetchUpstream: typeof fetch = fetch,
) {
  try {
    if (!origin) throw new Error('Missing backend origin');
    const base = new URL(origin);
    if (
      !['http:', 'https:'].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.pathname !== '/' ||
      base.search ||
      base.hash ||
      segments.some((segment) => segment === '.' || segment === '..')
    ) {
      throw new Error('Invalid backend origin or path');
    }

    const target = new URL(`/${segments.map(encodeURIComponent).join('/')}`, base);
    target.search = new URL(request.url).search;
    const headers = filteredHeaders(request.headers);
    // Node fetch decodes compressed responses; request uncompressed upstream bytes.
    headers.set('accept-encoding', 'identity');
    const init: RequestInit & { duplex?: 'half' } = {
      method: request.method,
      headers,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
    };
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
      init.body = request.body;
      init.duplex = 'half';
    }

    const upstream = await fetchUpstream(target, init);
    const responseHeaders = filteredHeaders(upstream.headers);
    responseHeaders.delete('content-encoding');
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) {
      responseHeaders.delete('set-cookie');
      for (const cookie of cookies) responseHeaders.append('set-cookie', cookie);
    }
    const location = responseHeaders.get('location');
    if (location) {
      const redirect = new URL(location, target);
      if (redirect.origin === base.origin) {
        responseHeaders.set(
          'location',
          `/api${redirect.pathname}${redirect.search}${redirect.hash}`,
        );
      }
    }
    responseHeaders.set('cache-control', 'no-store');
    const bodyless = request.method === 'HEAD' || [204, 205, 304].includes(upstream.status);
    return new Response(bodyless ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ error: 'Bad Gateway' }, { status: 502 });
  }
}
