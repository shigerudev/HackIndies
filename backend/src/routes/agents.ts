import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runTriage } from '../agents/triage/index.js';
import { TriageInputSchema } from '../agents/triage/schema.js';
import { runInvestigator } from '../agents/investigator/index.js';
import { InvestigatorInputSchema } from '../agents/investigator/schema.js';
import { routeMessage } from '../agents/router/index.js';
import { getDefenderBriefing } from '../agents/defender/index.js';
import { runNarrative } from '../agents/narrative/index.js';
import { findAgentTraces, deleteAgentTraces } from '../lib/agent-traces.js';
import { hasSupabase, hasMiniMax } from '../lib/env.js';

const pipelineSchema = z.object({
  event_id: z.string().uuid().optional(),
  signal: TriageInputSchema.shape.signal,
  reset: z.boolean().default(false),
});

const routeSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});

const defenderSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    institution_slug: z.string().optional(),
    event_id: z.string().uuid().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }).optional(),
});

const narrativeSchema = z.object({
  event_id: z.string().uuid(),
});

export async function registerAgentRoutes(app: FastifyInstance) {
  app.post('/api/agent/triage', async (req, reply) => {
    const parsed = TriageInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const result = await runTriage(parsed.data);
      return { ...result, provider: result.mock ? undefined : 'minimax' };
    } catch (err) {
      req.log.error(err, 'Triage failed');
      const message = err instanceof Error ? err.message : 'Triage failed';
      if (message === 'Event not found') return reply.status(404).send({ error: message });
      return reply.status(502).send({ error: message });
    }
  });

  app.post('/api/agent/investigate', async (req, reply) => {
    const parsed = InvestigatorInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const result = await runInvestigator(parsed.data);
      return { ...result, provider: result.mock ? undefined : 'minimax' };
    } catch (err) {
      req.log.error(err, 'Investigation failed');
      const message = err instanceof Error ? err.message : 'Investigation failed';
      if (message === 'Event not found') return reply.status(404).send({ error: message });
      return reply.status(502).send({ error: message });
    }
  });

  app.post('/api/agent/pipeline', async (req, reply) => {
    const parsed = pipelineSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    if (!parsed.data.event_id && !parsed.data.signal) {
      return reply.status(400).send({ error: 'Provide event_id or signal' });
    }

    const eventId = parsed.data.event_id;

    if (parsed.data.reset && eventId && hasSupabase()) {
      await deleteAgentTraces({ event_id: eventId });
    }

    try {
      const existingTriageTraces = eventId
        ? await findAgentTraces({ agent_name: 'triage', event_id: eventId })
        : [];
      const triageResult = await runTriage(
        { event_id: eventId, signal: parsed.data.signal },
        existingTriageTraces,
      );

      if (!eventId) {
        return {
          triage: triageResult.triage,
          mock: triageResult.mock,
          message: 'Pipeline partial: provide event_id to run investigator',
        };
      }

      const existingInvestigationTraces = await findAgentTraces({
        agent_name: 'investigator',
        event_id: eventId,
      });
      const investigationResult = await runInvestigator(
        { event_id: eventId, triage: triageResult.triage },
        existingInvestigationTraces,
      );

      return {
        triage: triageResult.triage,
        investigation: investigationResult.investigation,
        hitl_status: investigationResult.hitl_status,
        mock: triageResult.mock || investigationResult.mock,
        run_ids: {
          triage: triageResult.run_id,
          investigator: investigationResult.run_id,
        },
        replay:
          existingTriageTraces.length > 0 || existingInvestigationTraces.length > 0,
      };
    } catch (err) {
      req.log.error(err, 'Pipeline failed');
      const message = err instanceof Error ? err.message : 'Pipeline failed';
      if (message === 'Event not found') return reply.status(404).send({ error: message });
      return reply.status(502).send({ error: message });
    }
  });

  // POST /api/agent/route — route incoming message to appropriate agent
  app.post('/api/agent/route', async (req, reply) => {
    const parsed = routeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const { message, history } = parsed.data;
      const routing = await routeMessage(message, history);

      // Forward to the target agent
      if (routing.agent === 'defender') {
        const briefing = await getDefenderBriefing(message);
        return {
          routed_to: 'defender',
          routing,
          briefing,
        };
      }

      if (routing.agent === 'citizen') {
        // Hand off to citizen chat logic — delegate to /api/agent/chat
        const { generateCitizenReply } = await import('../lib/citizen-chat.js');
        const { normalizeChatMessages } = await import('../lib/chat-messages.js');
        const msgs = await normalizeChatMessages([{ role: 'user', content: message }]);
        const { content, mock } = await generateCitizenReply(msgs);
        return {
          routed_to: 'citizen',
          routing,
          response: { role: 'assistant', content, mock },
        };
      }

      // journalist / unknown — return classification, no action
      return {
        routed_to: routing.agent,
        routing,
        response: {
          content: 'Tu mensaje fue clasificado como ' + routing.agent + '. '
            + (routing.agent === 'journalist'
              ? 'Para investigación, contactá a través de los canales oficiales de NOMAD Centinela.'
              : 'No pudimos identificar el tipo de consulta. Probá con más contexto.'),
        },
      };
    } catch (err) {
      req.log.error(err, 'Route failed');
      return reply.status(502).send({ error: err instanceof Error ? err.message : 'Route failed' });
    }
  });

  // POST /api/agent/defender — direct defender briefing without routing
  app.post('/api/agent/defender', async (req, reply) => {
    const parsed = defenderSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const { message, context } = parsed.data;
      const briefing = await getDefenderBriefing(message, context);
      return { briefing, mock: !hasMiniMax() };
    } catch (err) {
      req.log.error(err, 'Defender briefing failed');
      return reply.status(502).send({ error: err instanceof Error ? err.message : 'Defender briefing failed' });
    }
  });

  // POST /api/agent/narrative — generate narrative draft from a published event
  app.post('/api/agent/narrative', async (req, reply) => {
    const parsed = narrativeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const { event_id } = parsed.data;
      const result = await runNarrative(event_id);
      return result;
    } catch (err) {
      req.log.error(err, 'Narrative generation failed');
      const msg = err instanceof Error ? err.message : 'Narrative failed';
      if (msg.includes('not found')) return reply.status(404).send({ error: msg });
      if (msg.includes("status is '")) return reply.status(400).send({ error: msg });
      return reply.status(502).send({ error: msg });
    }
  });
}