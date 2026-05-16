import type { FastifyInstance, FastifyRequest } from 'fastify';
import { hasMakeWebhook, env } from '../lib/env.js';
import {
  ingestMakeEvent,
  makeIngestSchema,
  rejectIfPii,
  MakeIngestError,
} from '../lib/make-ingest.js';
import { hasSupabase } from '../lib/env.js';

function extractWebhookSecret(req: FastifyRequest): string | undefined {
  const header =
    (req.headers['x-nomad-webhook-secret'] as string | undefined) ??
    (req.headers['x-make-webhook-secret'] as string | undefined);

  if (header) return header;

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  return undefined;
}

function verifyWebhookSecret(req: FastifyRequest): boolean {
  if (!hasMakeWebhook()) return false;
  const provided = extractWebhookSecret(req);
  return Boolean(provided && provided === env.makeWebhookSecret);
}

export async function registerMakeWebhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/make/ingest', async (req, reply) => {
    if (!hasMakeWebhook()) {
      return reply.status(503).send({
        error: 'Make webhook not configured',
        hint: 'Set MAKE_WEBHOOK_SECRET in backend/.env',
      });
    }

    if (!verifyWebhookSecret(req)) {
      return reply.status(401).send({ error: 'Invalid or missing webhook secret' });
    }

    const parsed = makeIngestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const piiError = rejectIfPii(parsed.data);
    if (piiError) {
      return reply.status(400).send({ error: piiError });
    }

    try {
      const result = await ingestMakeEvent(parsed.data);
      const statusCode = result.duplicate ? 200 : 201;
      return reply.status(statusCode).send({
        accepted: true,
        event_id: result.event_id,
        status: result.status,
        duplicate: result.duplicate,
        mock: result.mock,
        supabase: hasSupabase(),
      });
    } catch (err) {
      if (err instanceof MakeIngestError) {
        return reply.status(err.statusCode).send({ error: err.message, code: err.code });
      }
      req.log.error(err, 'Make ingest failed');
      return reply.status(500).send({ error: 'Ingest failed' });
    }
  });

  app.get('/api/webhooks/make/health', async (req, reply) => {
    if (!hasMakeWebhook()) {
      return reply.status(503).send({ configured: false });
    }
    if (!verifyWebhookSecret(req)) {
      return reply.status(401).send({ configured: true, authorized: false });
    }
    return { configured: true, authorized: true, supabase: hasSupabase() };
  });
}
