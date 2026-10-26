import { expect, test } from 'vitest';
import { readDatabaseConfig } from '../../src/database/config.js';

const validEnvironment: NodeJS.ProcessEnv = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGDATABASE: 'admin',
  PGUSER: 'admin',
  PGPASSWORD: 'secret-value',
};

test('database configuration requires all PostgreSQL settings without exposing values', () => {
  expect(() => readDatabaseConfig({})).toThrow(
    new Error(
      'Missing required PostgreSQL configuration: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD',
    ),
  );
});

test('database configuration parses a valid decimal port', () => {
  expect(readDatabaseConfig(validEnvironment)).toStrictEqual({
    host: 'localhost',
    port: 5432,
    database: 'admin',
    user: 'admin',
    password: 'secret-value',
  });
});

test('database configuration rejects empty and non-decimal or out-of-range ports', () => {
  for (const port of ['', '0', '65536', '1.5', '1e3', '0x10', 'NaN', 'Infinity', '-1', '+5432']) {
    const readConfig = () => readDatabaseConfig({ ...validEnvironment, PGPORT: port });
    expect(readConfig, `expected PGPORT=${JSON.stringify(port)} to be rejected`).toThrow(/PGPORT/);
    expect(readConfig).not.toThrow(/secret-value/);
  }
});

test('database configuration rejects whitespace-only required values', () => {
  expect(() => readDatabaseConfig({ ...validEnvironment, PGHOST: '  ' })).toThrow(/PGHOST/);
});
