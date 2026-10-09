import Fastify from 'fastify';
import app from './app.js';

const server = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

async function shutdown() {
  try {
    await server.close();
  } catch (error) {
    server.log.error(error);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT must be an integer between 0 and 65535');
  }
  await server.register(app);
  await server.listen({ port, host });
} catch (error) {
  server.log.error(error);
  await shutdown();
  process.exitCode = 1;
}
