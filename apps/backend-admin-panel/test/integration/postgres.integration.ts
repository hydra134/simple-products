import { expect, test } from 'vitest';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import app from '../../src/app.js';
import { readDatabaseConfig } from '../../src/database/config.js';
import { createDatabasePlugin } from '../../src/database/plugin.js';

const databaseNames = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'] as const;

function getIntegrationEnvironment(): NodeJS.ProcessEnv {
  const integrationEnvironment = readDatabaseConfig(process.env);

  if (!integrationEnvironment.database.endsWith('_integration')) {
    throw new Error(
      'PGDATABASE must name an isolated integration database ending in "_integration"',
    );
  }

  return {
    PGHOST: integrationEnvironment.host,
    PGPORT: String(integrationEnvironment.port),
    PGDATABASE: integrationEnvironment.database,
    PGUSER: integrationEnvironment.user,
    PGPASSWORD: integrationEnvironment.password,
  };
}

const noIntegrationEnvironment = databaseNames.every((name) => process.env[name] === undefined);

test(
  'PostgreSQL integration verifies a real query and closes its pool',
  { skip: noIntegrationEnvironment },
  async (t) => {
    const server = Fastify();
    const environment = getIntegrationEnvironment();
    const databasePlugin = createDatabasePlugin(environment);
    t.onTestFinished(async () => {
      if (!server.pg.pool.ended) {
        await server.close();
      }
    });

    await server.register(fp(app), { databasePlugin });
    await server.ready();

    const response = await server.inject('/health/ready');
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toStrictEqual({ status: 'ready' });

    await server.close();
    expect(server.pg.pool.ended).toBe(true);
  },
);

test(
  'PostgreSQL integration fails startup when the database is unreachable',
  { skip: noIntegrationEnvironment },
  async (t) => {
    const server = Fastify();
    const validEnvironment = getIntegrationEnvironment();
    const unreachableEnvironment = {
      ...validEnvironment,
      PGHOST: '127.0.0.1',
      PGPORT: '1',
    };
    t.onTestFinished(async () => {
      if (!server.pg.pool.ended) {
        await server.close().catch(() => undefined);
      }
    });

    await expect(async () => {
      await server.register(fp(app), {
        databasePlugin: createDatabasePlugin(unreachableEnvironment),
      });
      await server.ready();
    }).rejects.toThrow(new Error('Database connection check failed during startup'));
    await server.close().catch(() => undefined);
  },
);

test(
  'PostgreSQL integration rejects invalid credentials without leaking them',
  { skip: noIntegrationEnvironment },
  async (t) => {
    const server = Fastify();
    const validEnvironment = getIntegrationEnvironment();
    const invalidPassword = `${validEnvironment.PGPASSWORD}-invalid`;
    t.onTestFinished(async () => server.close().catch(() => undefined));
    await expect(async () => {
      await server.register(fp(app), {
        databasePlugin: createDatabasePlugin({
          ...validEnvironment,
          PGPASSWORD: invalidPassword,
        }),
      });
      await server.ready();
    }).rejects.toThrow(new Error('Database connection check failed during startup'));
  },
);
