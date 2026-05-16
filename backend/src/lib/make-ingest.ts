import { z } from 'zod';
import { getSupabase } from './supabase.js';

const emailLike = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

export const makeIngestSchema = z.object({
  institution_slug: z.string().min(1).max(80),
  title: z.string().min(1).max(500),
  summary: z.string().max(2000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  credentials_count: z.number().int().min(0).max(1_000_000).default(0),
  first_seen_at: z.string().datetime().optional(),
  actor_name: z.string().max(200).optional(),
  malware_family: z.string().max(100).optional(),
  external_id: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MakeIngestBody = z.infer<typeof makeIngestSchema>;

function containsPii(text: string): boolean {
  return emailLike.test(text);
}

export function rejectIfPii(body: MakeIngestBody): string | null {
  const fields = [body.title, body.summary, body.actor_name].filter(Boolean) as string[];
  for (const f of fields) {
    if (containsPii(f)) return 'Request must not contain email addresses or PII in text fields';
  }
  return null;
}

export async function ingestMakeEvent(body: MakeIngestBody): Promise<{
  event_id: string;
  status: string;
  duplicate: boolean;
  mock: boolean;
}> {
  const sb = getSupabase();
  if (!sb) {
    return {
      event_id: crypto.randomUUID(),
      status: 'pending_review',
      duplicate: false,
      mock: true,
    };
  }

  const { data: institution, error: instErr } = await sb
    .from('institutions')
    .select('id')
    .eq('slug', body.institution_slug)
    .single();

  if (instErr || !institution) {
    throw new MakeIngestError('unknown_institution', `Unknown institution_slug: ${body.institution_slug}`, 400);
  }

  if (body.external_id) {
    const { data: existing } = await sb
      .from('exposure_events')
      .select('id, status')
      .eq('source_type', 'make_webhook')
      .contains('payload', { make_external_id: body.external_id })
      .maybeSingle();

    if (existing) {
      return {
        event_id: existing.id,
        status: existing.status,
        duplicate: true,
        mock: false,
      };
    }
  }

  let actorId: string | null = null;
  if (body.actor_name) {
    const { data: actor } = await sb.from('actors').select('id').eq('name', body.actor_name).maybeSingle();
    actorId = actor?.id ?? null;
  }

  const payload = {
    make_external_id: body.external_id ?? null,
    ingested_at: new Date().toISOString(),
    source: 'make.com',
    metadata: body.metadata ?? {},
  };

  const { data: created, error: insertErr } = await sb
    .from('exposure_events')
    .insert({
      institution_id: institution.id,
      actor_id: actorId,
      source_type: 'make_webhook',
      severity: body.severity,
      malware_family: body.malware_family ?? null,
      credentials_count: body.credentials_count,
      first_seen_at: body.first_seen_at ?? new Date().toISOString(),
      status: 'pending_review',
      title: body.title,
      summary: body.summary ?? null,
      payload,
    })
    .select('id, status')
    .single();

  if (insertErr || !created) {
    throw new MakeIngestError('insert_failed', insertErr?.message ?? 'Insert failed', 500);
  }

  await sb.from('agent_traces').insert({
    agent_name: 'make_ingest',
    run_id: body.external_id ?? created.id,
    event_id: created.id,
    input: { institution_slug: body.institution_slug, title: body.title, external_id: body.external_id },
    output: { status: created.status },
    tools_called: [],
  });

  return {
    event_id: created.id,
    status: created.status,
    duplicate: false,
    mock: false,
  };
}

export class MakeIngestError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'MakeIngestError';
  }
}
