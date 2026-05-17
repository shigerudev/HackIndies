import { generateStructured } from '../../lib/structured-llm.js';
import { hasMiniMax } from '../../lib/env.js';
import { saveAgentTrace } from '../../lib/agent-traces.js';
import { getSupabase } from '../../lib/supabase.js';
import { hasSupabase } from '../../lib/env.js';
import { MOCK_EVENTS, MOCK_INSTITUTIONS } from '../../data/mock.js';
import { TRIAGE_SYSTEM_PROMPT } from './prompt.js';
import { TriageOutputSchema, type TriageInput, type TriageOutput } from './schema.js';

function mockTriage(signal: { title: string; summary?: string; institution_slug?: string }, reason?: string): TriageOutput {
  const slug = signal.institution_slug ?? 'digecam';
  const lower = `${signal.title} ${signal.summary ?? ''}`.toLowerCase();
  const severity =
    lower.includes('crític') || lower.includes('critical') || lower.includes('masiva')
      ? 'critical'
      : lower.includes('ransom') || lower.includes('alto')
        ? 'high'
        : 'medium';
  return {
    institution_slug: slug,
    severity,
    suggested_title: signal.title,
    suggested_summary: signal.summary ?? 'Señal en revisión (modo demo).',
    malware_family: lower.includes('stealer') ? 'infostealer' : null,
    credentials_count_estimate: 0,
    confidence: 0.65,
    reasoning_brief: reason ?? 'Clasificación heurística en modo mock (sin MiniMax).',
  };
}

async function loadEventContext(eventId: string) {
  if (!hasSupabase()) {
    const e = MOCK_EVENTS.find((x) => x.id === eventId);
    if (!e) return null;
    return {
      title: e.title,
      summary: e.summary ?? '',
      institution_slug: e.institution_slug,
      source_type: e.source_type ?? 'public_report',
    };
  }
  const sb = getSupabase()!;
  const { data } = await sb
    .from('v_events_detail')
    .select('title, summary, institution_slug, source_type')
    .eq('id', eventId)
    .single();
  return data;
}

async function listInstitutionSlugs(): Promise<string[]> {
  if (!hasSupabase()) return MOCK_INSTITUTIONS.map((i) => i.slug);
  const sb = getSupabase()!;
  const { data } = await sb.from('institutions').select('slug');
  return (data ?? []).map((r) => r.slug);
}

export async function runTriage(
  input: TriageInput,
  existingTraces?: { run_id: string; latency_ms: number }[],
): Promise<{ triage: TriageOutput; mock: boolean; run_id: string; event_id?: string; _error?: string }> {
  const started = Date.now();
  let signal: { title: string; summary?: string; institution_slug?: string; source_type?: string };

  if (input.event_id) {
    const ctx = await loadEventContext(input.event_id);
    if (!ctx) throw new Error('Event not found');
    signal = {
      title: ctx.title,
      summary: ctx.summary ?? undefined,
      institution_slug: ctx.institution_slug,
      source_type: ctx.source_type,
    };
  } else if (input.signal) {
    signal = input.signal;
  } else {
    throw new Error('Provide event_id or signal');
  }

  if (existingTraces && existingTraces.length > 0) {
    const last = existingTraces[existingTraces.length - 1] as { run_id: string; latency_ms: number; output: TriageOutput };
    return {
      triage: last.output,
      mock: false,
      run_id: last.run_id,
      event_id: input.event_id,
    };
  }

  let triage: TriageOutput;
  let mock = false;

  if (!hasMiniMax()) {
    triage = mockTriage(signal);
    mock = true;
  } else {
    const slugs = await listInstitutionSlugs();
    try {
      const raw = await generateStructured({
        schema: TriageOutputSchema,
        system: TRIAGE_SYSTEM_PROMPT,
        prompt: `Instituciones válidas (slug): ${slugs.join(', ')}

Señal a clasificar:
${JSON.stringify(signal, null, 2)}`,
      });
      triage = TriageOutputSchema.parse({
        ...raw,
        institution_slug: raw.institution_slug || signal.institution_slug || slugs[0],
        suggested_title: raw.suggested_title || signal.title,
        suggested_summary: raw.suggested_summary || signal.summary || '',
        confidence: raw.confidence ?? 0.7,
        credentials_count_estimate: raw.credentials_count_estimate ?? 0,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[triage] LLM call failed, falling back to mock', {
        error: errMsg,
        stack: err instanceof Error ? err.stack : undefined,
      });
      triage = mockTriage(signal, `LLM falló: ${errMsg}`);
      mock = true;
    }
  }

  const { run_id } = await saveAgentTrace({
    agent_name: 'triage',
    event_id: input.event_id ?? null,
    input: { signal, event_id: input.event_id },
    output: triage as unknown as Record<string, unknown>,
    tools_called: [],
    latency_ms: Date.now() - started,
  });

  const result: { triage: TriageOutput; mock: boolean; run_id: string; event_id?: string; _error?: string } = {
    triage,
    mock,
    run_id,
    event_id: input.event_id,
  };
  if (mock && !hasMiniMax()) {
    // intentional mock — no error
  } else if (mock) {
    result._error = 'Triage cayó a mock luego de error de LLM. Ver logs del servidor.';
  }

  if (input.event_id && hasSupabase() && !mock) {
    const sb = getSupabase()!;
    await sb
      .from('exposure_events')
      .update({
        severity: triage.severity,
        title: triage.suggested_title,
        summary: triage.suggested_summary,
        malware_family: triage.malware_family ?? null,
        credentials_count: triage.credentials_count_estimate,
      })
      .eq('id', input.event_id);
  }

  return {
    triage,
    mock,
    run_id,
    event_id: input.event_id,
    ...(mock && hasMiniMax() ? { _error: `LLM falló: ver reasoning_brief` } : {}),
  };
}
