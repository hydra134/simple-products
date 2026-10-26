import postgres from '@fastify/postgres';
import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { readDatabaseConfig } from './config.js';

export type DatabasePluginOptions = {
  environment?: NodeJS.ProcessEnv;
};

const databasePlugin: FastifyPluginAsync<DatabasePluginOptions> = async (fastify, options) => {
  const config = readDatabaseConfig(options.environment);

  await fastify.register(postgres, {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: false,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    query_timeout: 5000,
  });

  fastify.pg.pool.on('error', () => {
    fastify.log.error('An idle PostgreSQL connection failed');
  });
  fastify.decorate('checkDatabase', async () => {
    await fastify.pg.query('SELECT 1');
  });
};

export function createDatabasePlugin(environment?: NodeJS.ProcessEnv): FastifyPluginAsync {
  return fp(async (fastify) => databasePlugin(fastify, { environment }));
}

export default createDatabasePlugin();

declare module 'fastify' {
  interface FastifyInstance {
    checkDatabase(): Promise<void>;
  }
}
