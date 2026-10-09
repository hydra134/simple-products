import { type FastifyPluginAsync } from 'fastify';

const test: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/asd', async function (request, reply) {
    return { fuckYou: false };
  });
};

export default test;
