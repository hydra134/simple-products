import path from 'node:path';
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload';
import { type FastifyPluginAsync } from 'fastify';

export type AppOptions = Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (fastify, options) => {
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'plugins'),
    options,
    forceESM: true,
  });
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'routes'),
    options,
    forceESM: true,
  });
};

export default app;
