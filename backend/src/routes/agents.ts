import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runTriage } from '../agents/triage/index.js';
import { TriageInputSchema } from '../agents/triage/schema.js';
import { runInvestigator } from '../agents/investigator/index.js';
import { InvestigatorInputSchema } from '../agents/investigator/schema.js';

const pipelineSchema = z.object({
  event_id: z.string().uuid().optional(),
  signal: TriageInputSchema.shape.signal,
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
      req.log.error(err, 'Investigator failed');
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
    try {
      const triageResult = await runTriage({
        event_id: parsed.data.event_id,
        signal: parsed.data.signal,
      });
      const eventId = parsed.data.event_id;
      if (!eventId) {
        return {
          triage: triageResult.triage,
          mock: triageResult.mock,
          message: 'Pipeline partial: provide event_id to run investigator',
        };
      }
      const investigationResult = await runInvestigator({
        event_id: eventId,
        triage: triageResult.triage,
      });
      return {
        triage: triageResult.triage,
        investigation: investigationResult.investigation,
        hitl_status: investigationResult.hitl_status,
        mock: triageResult.mock || investigationResult.mock,
        run_ids: {
          triage: triageResult.run_id,
          investigator: investigationResult.run_id,
        },
      };
    } catch (err) {
      req.log.error(err, 'Pipeline failed');
      const message = err instanceof Error ? err.message : 'Pipeline failed';
      if (message === 'Event not found') return reply.status(404).send({ error: message });
      return reply.status(502).send({ error: message });
    }
  });
}
