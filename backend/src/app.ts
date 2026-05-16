import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerApiRoutes } from './routes/api.js';
import { registerMakeWebhookRoutes } from './routes/webhooks-make.js';
import { registerAgentRoutes } from './routes/agents.js';
import { registerDevRoutes } from './routes/dev.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.VERCEL !== '1' });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  app.get('/', async () => ({
    service: 'NOMAD Centinela API',
    version: '0.1.0',
    health: '/api/health',
    hint: 'Usar rutas /api/* — ver shared/openapi.yaml',
  }));

  await registerApiRoutes(app);
  await registerMakeWebhookRoutes(app);
  await registerAgentRoutes(app);
  await registerDevRoutes(app);

  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);
    reply.status(500).send({ error: 'Internal server error' });
  });

  await app.ready();
  return app;
}
