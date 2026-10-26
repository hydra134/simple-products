import { proxyRequest } from '../../../lib/api-proxy.server';

async function proxy(request: Request, context: RouteContext<'/api/[...path]'>) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export {
  proxy as GET,
  proxy as HEAD,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
