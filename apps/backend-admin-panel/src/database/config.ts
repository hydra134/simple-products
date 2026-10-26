export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

const requiredVariables = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'] as const;

export function readDatabaseConfig(environment: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const missingVariables = requiredVariables.filter((name) => !environment[name]?.trim());
  if (missingVariables.length > 0) {
    throw new Error(`Missing required PostgreSQL configuration: ${missingVariables.join(', ')}`);
  }

  const portValue = environment.PGPORT;
  if (portValue === undefined || !/^\d+$/.test(portValue)) {
    throw new Error('PGPORT must be a decimal integer between 1 and 65535');
  }

  const port = Number(portValue);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('PGPORT must be a decimal integer between 1 and 65535');
  }

  return {
    host: environment.PGHOST as string,
    port,
    database: environment.PGDATABASE as string,
    user: environment.PGUSER as string,
    password: environment.PGPASSWORD as string,
  };
}
