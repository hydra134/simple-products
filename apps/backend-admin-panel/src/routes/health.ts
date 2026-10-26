import { type FastifyPluginAsync } from 'fastify';

const health: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health/live', async () => ({ status: 'ok' }));

  fastify.get('/health/ready', async (_request, reply) => {
    try {
      await fastify.checkDatabase();
      return { status: 'ready' };
    } catch {
      fastify.log.warn('PostgreSQL readiness check failed');
      return reply.code(503).send({ status: 'not_ready' });
    }
  });
};

export default health;
