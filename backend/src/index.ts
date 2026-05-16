import { env, hasSupabase } from './lib/env.js';
import { buildApp } from './app.js';

const app = await buildApp();

try {
  await app.listen({ port: env.port, host: env.host });
  console.log(`NOMAD Centinela API http://${env.host}:${env.port}`);
  console.log(`  Supabase: ${hasSupabase() ? 'connected' : 'MOCK mode (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)'}`);
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
