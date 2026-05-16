import { generateStructured } from '../../lib/structured-llm.js';
import { hasMiniMax } from '../../lib/env.js';
import { saveAgentTrace } from '../../lib/agent-traces.js';
import { getSupabase } from '../../lib/supabase.js';
import { hasSupabase } from '../../lib/env.js';
import { MOCK_EVENTS } from '../../data/mock.js';
import { searchOSINT, compareSources } from '../../tools/osint.js';
import { INVESTIGATOR_SYSTEM_PROMPT } from './prompt.js';
import {
  InvestigatorOutputSchema,
  type InvestigatorInput,
  type InvestigatorOutput,
} from './schema.js';
import type { TriageOutput } from '../triage/schema.js';

function mockInvestigate(institutionSlug: string): InvestigatorOutput {
  return {
    label: 'strong_evidence',
    confidence: 0.78,
    sources_summary: [{ source_type: 'internal_db', note: 'Eventos sintéticos relacionados' }],
    recommendation: 'approve_for_review',
    reasoning_brief: 'Evidencia interna consistente (modo mock).',
    hitl_required: true,
  };
}

async function loadEventForInvestigation(eventId: string) {
  if (!hasSupabase()) {
    const e = MOCK_EVENTS.find((x) => x.id === eventId);
    if (!e) return null;
    return {
      title: e.title,
      summary: e.summary ?? '',
      institution_slug: e.institution_slug,
      status: e.status,
    };
  }
  const sb = getSupabase()!;
  const { data } = await sb
    .from('v_events_detail')
    .select('title, summary, institution_slug, status')
    .eq('id', eventId)
    .single();
  return data;
}

export async function runInvestigator(input: InvestigatorInput): Promise<{
  investigation: InvestigatorOutput;
  mock: boolean;
  run_id: string;
  hitl_status: 'pending_review';
  osint_context: Awaited<ReturnType<typeof searchOSINT>>;
}> {
  const started = Date.now();
  const event = await loadEventForInvestigation(input.event_id);
  if (!event) throw new Error('Event not found');

  const triage = input.triage as TriageOutput | undefined;
  const institutionSlug = triage?.institution_slug ?? event.institution_slug;
  const claim = triage?.suggested_summary ?? event.summary ?? event.title;

  const tools_called: Array<{ tool: string; ms: number }> = [];
  let t0 = Date.now();
  const osint_context = await searchOSINT(institutionSlug);
  tools_called.push({ tool: 'searchOSINT', ms: Date.now() - t0 });

  t0 = Date.now();
  const compare = await compareSources(institutionSlug, claim);
  tools_called.push({ tool: 'compareSources', ms: Date.now() - t0 });

  let investigation: InvestigatorOutput;
  let mock = false;

  if (!hasMiniMax()) {
    investigation = mockInvestigate(institutionSlug);
    mock = true;
  } else {
    try {
      investigation = await generateStructured({
        schema: InvestigatorOutputSchema,
        system: INVESTIGATOR_SYSTEM_PROMPT,
        prompt: `Evento:
${JSON.stringify(event, null, 2)}

Triage previo:
${JSON.stringify(triage ?? {}, null, 2)}

searchOSINT:
${JSON.stringify(osint_context, null, 2)}

compareSources:
${JSON.stringify(compare, null, 2)}`,
      });
    } catch {
      investigation = mockInvestigate(institutionSlug);
      mock = true;
    }
  }

  const { run_id } = await saveAgentTrace({
    agent_name: 'investigator',
    event_id: input.event_id,
    input: { event_id: input.event_id, triage },
    output: investigation as unknown as Record<string, unknown>,
    tools_called,
    latency_ms: Date.now() - started,
  });

  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data: inst } = await sb.from('institutions').select('id').eq('slug', institutionSlug).single();
    if (inst) {
      await sb.from('breach_status').insert({
        institution_id: inst.id,
        event_id: input.event_id,
        label: investigation.label,
        notes: investigation.reasoning_brief,
      });
    }
  }

  return {
    investigation,
    mock,
    run_id,
    hitl_status: 'pending_review',
    osint_context,
  };
}
