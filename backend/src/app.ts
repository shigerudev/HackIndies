import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerApiRoutes } from './routes/api.js';
import { registerMakeWebhookRoutes } from './routes/webhooks-make.js';
import { registerAgentRoutes } from './routes/agents.js';
import { registerHitlRoutes } from './routes/hitl.js';
import { registerDevRoutes } from './routes/dev.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: [
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      /^https:\/\/nomad-centinela-v2(-[a-z0-9]+)?\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  await registerHitlRoutes(app);

  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const fastifyError = err as { message: string; code?: string };
    reply.status(statusCode).send({
      error: fastifyError.message,
      code: fastifyError.code,
      status: statusCode,
    });
  });

  await app.ready();
  return app;
}
