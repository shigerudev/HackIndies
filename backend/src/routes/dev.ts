import type { FastifyInstance } from 'fastify';
import { hasSupabase } from '../lib/env.js';
import { getSupabase } from '../lib/supabase.js';
import { deleteAgentTraces, findAgentTraces } from '../lib/agent-traces.js';

export function registerDevRoutes(app: FastifyInstance) {
  // A1.2: Reset event state — wipe traces + breach_status, gated by DEMO_MODE env var
  app.post('/api/dev/reset-event/:id', async (req, reply) => {
    if (process.env.DEMO_MODE !== 'true') {
      return reply.status(403).send({ error: 'DEMO_MODE not enabled' });
    }

    const { id } = req.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Missing event id' });

    if (!hasSupabase()) {
      return { success: true, mock: true, message: 'No Supabase — nothing to reset in mock mode' };
    }

    const sb = getSupabase()!;

    await deleteAgentTraces({ event_id: id });
    await sb.from('breach_status').delete().eq('event_id', id);
    await sb.from('exposure_events').update({ status: 'pending_review' }).eq('id', id);

    return {
      success: true,
      event_id: id,
      message: `Event ${id} reset — traces and breach_status cleared, status → pending_review`,
    };
  });

  // A3: List demo presets
  app.get('/api/dev/presets', async () => {
    const { DEMO_PRESETS } = await import('../data/demo-presets.js');
    return { data: DEMO_PRESETS };
  });

  // A3: Trigger a demo preset — ingest + run pipeline in one shot
  app.post('/api/dev/run-preset/:presetId', async (req, reply) => {
    if (process.env.DEMO_MODE !== 'true') {
      return reply.status(403).send({ error: 'DEMO_MODE not enabled' });
    }

    const { presetId } = req.params as { presetId: string };
    const { DEMO_PRESETS } = await import('../data/demo-presets.js');
    const preset = DEMO_PRESETS[presetId];
    if (!preset) return reply.status(404).send({ error: `Preset '${presetId}' not found` });

    const sb = getSupabase();
    if (!sb) return reply.status(503).send({ error: 'Supabase not configured' });

    const existingTraces = await findAgentTraces({
      agent_name: 'triage',
      event_id: preset.event_id,
    });
    if (existingTraces.length > 0) {
      const { runTriage } = await import('../agents/triage/index.js');
      const { runInvestigator } = await import('../agents/investigator/index.js');
      const triageTraces = await findAgentTraces({
        agent_name: 'triage',
        event_id: preset.event_id,
      });
      const invTraces = await findAgentTraces({
        agent_name: 'investigator',
        event_id: preset.event_id,
      });
      const triageResult = await runTriage({ event_id: preset.event_id }, triageTraces);
      const invResult = await runInvestigator(
        { event_id: preset.event_id, triage: triageResult.triage },
        invTraces,
      );
      return {
        preset_id: presetId,
        event_id: preset.event_id,
        already_run: true,
        replay: true,
        triage: triageResult.triage,
        investigation: invResult.investigation,
        hitl_status: invResult.hitl_status,
        mock: false,
        run_ids: { triage: triageResult.run_id, investigator: invResult.run_id },
      };
    }

    const { rejectIfPii, makeIngestSchema } = await import('../lib/make-ingest.js');
    const parsed = makeIngestSchema.safeParse(preset.ingest_payload);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const piiError = rejectIfPii(parsed.data);
    if (piiError) return reply.status(400).send({ error: piiError });

    const { ingestMakeEvent } = await import('../lib/make-ingest.js');
    const ingestResult = await ingestMakeEvent(parsed.data);

    const { runTriage } = await import('../agents/triage/index.js');
    const { runInvestigator } = await import('../agents/investigator/index.js');
    const triageResult = await runTriage({ event_id: ingestResult.event_id });
    const invResult = await runInvestigator({
      event_id: ingestResult.event_id,
      triage: triageResult.triage,
    });

    return {
      preset_id: presetId,
      event_id: ingestResult.event_id,
      already_run: false,
      ingest: { event_id: ingestResult.event_id, duplicate: ingestResult.duplicate },
      triage: triageResult.triage,
      investigation: invResult.investigation,
      hitl_status: invResult.hitl_status,
      mock: triageResult.mock || invResult.mock,
      run_ids: { triage: triageResult.run_id, investigator: invResult.run_id },
    };
  });
}