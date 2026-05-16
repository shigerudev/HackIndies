import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env, hasSupabase } from './lib/env.js';
import { registerApiRoutes } from './routes/api.js';
import { registerMakeWebhookRoutes } from './routes/webhooks-make.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
});

await registerApiRoutes(app);
await registerMakeWebhookRoutes(app);

app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  reply.status(500).send({ error: 'Internal server error' });
});

try {
  await app.listen({ port: env.port, host: env.host });
  console.log(`NOMAD Centinela API http://${env.host}:${env.port}`);
  console.log(`  Supabase: ${hasSupabase() ? 'connected' : 'MOCK mode (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)'}`);
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
