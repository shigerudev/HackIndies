import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { hasSupabase, env } from '../lib/env.js';
import { getSupabase } from '../lib/supabase.js';

function useMock(): boolean {
  return !hasSupabase();
}

const reviewerSchema = z.object({
  reviewer: z.string().min(1).max(100).default('defensor-anon'),
  comment: z.string().max(500).optional(),
});

const hitlTokenSchema = z.object({
  'x-hitl-token': z.string(),
});

export async function registerHitlRoutes(app: FastifyInstance) {
  // Validate HITL token on all routes
  app.addHook('preHandler', async (req, reply) => {
    // Allow mock/dev bypass
    if (useMock()) return;
    const token = req.headers['x-hitl-token'];
    const expected = process.env.HITL_TOKEN ?? env.makeWebhookSecret;
    if (!expected || token !== expected) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // GET /api/hitl/pending — list events needing review
  app.get('/api/hitl/pending', async () => {
    if (useMock()) {
      return { data: [], mock: true };
    }
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from('v_events_detail')
      .select('id, title, summary, severity, status, institution_name, institution_slug, first_seen_at')
      .eq('status', 'pending_review')
      .order('first_seen_at', { ascending: false });
    if (error) throw error;
    return { data: data ?? [], mock: false };
  });

  // GET /api/hitl/:event_id — get event with traces and reviews
  app.get<{ Params: { event_id: string } }>('/api/hitl/:event_id', async (req, reply) => {
    if (useMock()) {
      return reply.status(404).send({ error: 'No mock for HITL detail' });
    }
    const sb = getSupabase()!;
    const { data: event, error } = await sb
      .from('v_events_detail')
      .select('*')
      .eq('id', req.params.event_id)
      .single();
    if (error || !event) return reply.status(404).send({ error: 'Event not found' });

    const { data: traces } = await sb.from('agent_traces').select('*').eq('event_id', req.params.event_id);
    const { data: reviews } = await sb.from('hitl_reviews').select('*').eq('event_id', req.params.event_id);

    return {
      data: {
        ...event,
        traces: traces ?? [],
        hitl_reviews: reviews ?? [],
      },
      mock: false,
    };
  });

  // POST /api/hitl/:event_id/approve
  app.post<{ Params: { event_id: string }; Body: z.infer<typeof reviewerSchema> }>(
    '/api/hitl/:event_id/approve',
    async (req, reply) => {
      const { event_id } = req.params;
      const parsed = reviewerSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const { reviewer, comment } = parsed.data;

      if (useMock()) {
        return {
          success: true,
          event_id,
          decision: 'approved',
          mock: true,
        };
      }

      const sb = getSupabase()!;

      // Insert hitl_review
      const { error: reviewError } = await sb.from('hitl_reviews').insert({
        event_id,
        reviewer,
        decision: 'approved',
        comment: comment ?? null,
      });
      if (reviewError) throw reviewError;

      // Update event status to published
      const { error: updateError } = await sb
        .from('exposure_events')
        .update({ status: 'published' })
        .eq('id', event_id);
      if (updateError) throw updateError;

      return {
        success: true,
        event_id,
        decision: 'approved',
        reviewer,
        mock: false,
      };
    },
  );

  // POST /api/hitl/:event_id/reject
  app.post<{ Params: { event_id: string }; Body: z.infer<typeof reviewerSchema> }>(
    '/api/hitl/:event_id/reject',
    async (req, reply) => {
      const { event_id } = req.params;
      const parsed = reviewerSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const { reviewer, comment } = parsed.data;

      if (useMock()) {
        return {
          success: true,
          event_id,
          decision: 'rejected',
          mock: true,
        };
      }

      const sb = getSupabase()!;

      const { error: reviewError } = await sb.from('hitl_reviews').insert({
        event_id,
        reviewer,
        decision: 'rejected',
        comment: comment ?? null,
      });
      if (reviewError) throw reviewError;

      const { error: updateError } = await sb
        .from('exposure_events')
        .update({ status: 'rejected' })
        .eq('id', event_id);
      if (updateError) throw updateError;

      return {
        success: true,
        event_id,
        decision: 'rejected',
        reviewer,
        mock: false,
      };
    },
  );
}