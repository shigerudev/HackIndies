import { generateObject } from 'ai';
import { z } from 'zod';
import { hasMiniMax, env } from '../../lib/env.js';
import { getSupabase } from '../../lib/supabase.js';
import { hasSupabase } from '../../lib/env.js';
import { saveAgentTrace } from '../../lib/agent-traces.js';
import { NARRATIVE_SYSTEM_PROMPT, NARRATIVE_USER_PROMPT_TEMPLATE } from './prompt.js';
import { NarrativeOutputSchema, type NarrativeOutput } from './schema.js';
import { getMinimaxModel } from '../../lib/minimax.js';

interface EventContext {
  id: string;
  title: string;
  summary: string | null;
  institution_name: string;
  severity: string;
  first_seen_at: string;
  actor_name: string | null;
  status: string;
}

function buildTracesContext(traces: { agent_name: string; output: Record<string, unknown> }[]): string {
  if (!traces?.length) return 'Sin trazas de agentes.';
  return traces
    .map((t) => `[${t.agent_name}]: ${JSON.stringify(t.output).substring(0, 300)}`)
    .join('\n\n');
}

function buildReviewsContext(reviews: { decision: string; reviewer: string; comment: string | null }[]): string {
  if (!reviews?.length) return 'Sin revisiones HITL.';
  return reviews
    .map((r) => `${r.decision} por ${r.reviewer}${r.comment ? ` - "${r.comment}"` : ''}`)
    .join('\n');
}

function mockNarrative(event: EventContext): NarrativeOutput {
  return {
    title_es: `Alerta temprana: señales de exposición en ${event.institution_name}`,
    body_md: `Un análisis de NOMAD Centinela identificó actividad sospechosa relacionada con credenciales institucionales en ${event.institution_name}. El evento fue clasificado como **${event.severity}** y procesado mediante los agentes Triage, Investigator con verificación humana.\n\nEl sistema Detectó la señal en fase temprana, permitiendo a los defensores actuar antes de la confirmación oficial. Este tipo de respuesta proactiva es exactamente lo que Nomad Centinela busca facilitar en instituciones publicas de LATAM.\n\nSe recomienda revisar los playbooks de remediación disponibles para el sector.`,
    key_facts: [
      { fact: `Evento clasificado como ${event.severity.toUpperCase()}`, source: 'Agente Triage / NOMAD Centinela' },
      { fact: `Institución afectada: ${event.institution_name}`, source: 'Datos del evento' },
      { fact: 'Revisado y aprobado por human-in-the-loop antes de publicación', source: 'Panel HITL' },
    ],
    sources_cited: ['Reporte interno NOMAD Centinela'],
    draft_quality: 'needs_facts',
    confidence: 0.45,
  };
}

export async function runNarrative(eventId: string): Promise<{ narrative: NarrativeOutput; mock: boolean; run_id: string }> {
  const started = Date.now();

  // Load event — must be published
  let event: EventContext | null = null;
  let traces: { agent_name: string; output: Record<string, unknown> }[] = [];
  let reviews: { decision: string; reviewer: string; comment: string | null }[] = [];

  if (hasSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb
      .from('v_events_detail')
      .select('id, title, summary, institution_name, severity, first_seen_at, actor_name, status')
      .eq('id', eventId)
      .single();

    if (!data) throw new Error('Event not found');

    // Guardrail: only published events
    if (data.status !== 'published') {
      throw new Error(`Event status is '${data.status}', must be 'published' to generate narrative`);
    }

    event = data as EventContext;

    const [tracesRes, reviewsRes] = await Promise.all([
      sb.from('agent_traces').select('agent_name, output').eq('event_id', eventId).order('created_at'),
      sb.from('hitl_reviews').select('decision, reviewer, comment').eq('event_id', eventId),
    ]);

    traces = (tracesRes.data ?? []) as { agent_name: string; output: Record<string, unknown> }[];
    reviews = (reviewsRes.data ?? []) as { decision: string; reviewer: string; comment: string | null }[];
  }

  let narrative: NarrativeOutput;
  let mock = false;

  if (!hasMiniMax()) {
    if (!event) throw new Error('Event not found');
    narrative = mockNarrative(event);
    mock = true;
  } else {
    if (!event) throw new Error('Event not found');

    const userPrompt = NARRATIVE_USER_PROMPT_TEMPLATE
      .replace('{event_id}', event.id)
      .replace('{title}', event.title)
      .replace('{summary}', event.summary ?? 'Sin resumen disponible')
      .replace('{institution_name}', event.institution_name)
      .replace('{severity}', event.severity)
      .replace('{first_seen_at}', event.first_seen_at)
      .replace('{actor_name}', event.actor_name ?? 'No identificado')
      .replace('{traces}', buildTracesContext(traces))
      .replace('{hitl_reviews}', buildReviewsContext(reviews));

    const model = getMinimaxModel();
    try {
      const { object } = await generateObject({
        model,
        system: NARRATIVE_SYSTEM_PROMPT,
        prompt: userPrompt,
        schema: NarrativeOutputSchema,
      });
      narrative = object;
    } catch (err) {
      console.error('[narrative] MiniMax failed, fallback:', err);
      narrative = mockNarrative(event);
      mock = true;
    }
  }

  const { run_id } = await saveAgentTrace({
    agent_name: 'narrative',
    event_id: eventId,
    input: { event_id: eventId },
    output: narrative as unknown as Record<string, unknown>,
    tools_called: [],
    latency_ms: Date.now() - started,
  });

  return { narrative, mock, run_id };
}