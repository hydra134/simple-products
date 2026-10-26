import path from 'node:path';
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload';
import { type FastifyPluginAsync } from 'fastify';
import postgresPlugin from './database/plugin.js';

export type AppOptions = Partial<AutoloadPluginOptions> & {
  databasePlugin?: FastifyPluginAsync;
};

const app: FastifyPluginAsync<AppOptions> = async (fastify, options) => {
  const { databasePlugin = postgresPlugin, ...autoloadOptions } = options;

  await fastify.register(databasePlugin);
  try {
    await fastify.checkDatabase();
  } catch {
    throw new Error('Database connection check failed during startup');
  }

  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'plugins'),
    options: autoloadOptions,
    forceESM: true,
  });
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'routes'),
    options: autoloadOptions,
    forceESM: true,
  });
};

export default app;
