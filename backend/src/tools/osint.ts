import { getSupabase } from '../lib/supabase.js';
import { hasSupabase } from '../lib/env.js';
import { MOCK_EVENTS, MOCK_INSTITUTIONS } from '../data/mock.js';

export type OsintContext = {
  institution_slug: string;
  institution_name: string;
  related_events: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    source_type?: string;
  }>;
  breach_labels: Array<{ label: string; notes: string | null }>;
  actors: string[];
};

export type CompareSourcesResult = {
  institution_slug: string;
  labels_found: string[];
  aligned: boolean;
  notes: string[];
};

export async function searchOSINT(institutionSlug: string): Promise<OsintContext> {
  if (!hasSupabase()) {
    const inst = MOCK_INSTITUTIONS.find((i) => i.slug === institutionSlug);
    const related = MOCK_EVENTS.filter((e) => e.institution_slug === institutionSlug).map((e) => ({
      id: e.id,
      title: e.title,
      severity: e.severity,
      status: e.status,
      source_type: e.source_type,
    }));
    return {
      institution_slug: institutionSlug,
      institution_name: inst?.name ?? institutionSlug,
      related_events: related,
      breach_labels: related.some((e) => e.status === 'published')
        ? [{ label: 'strong_evidence', notes: 'mock: eventos publicados previos' }]
        : [],
      actors: [...new Set(MOCK_EVENTS.filter((e) => e.institution_slug === institutionSlug && e.actor_name).map((e) => e.actor_name!))],
    };
  }

  const sb = getSupabase()!;
  const { data: instRow } = await sb.from('institutions').select('id, slug, name').eq('slug', institutionSlug).single();

  const { data: events } = await sb
    .from('v_events_detail')
    .select('id, title, severity, status, source_type, actor_name')
    .eq('institution_slug', institutionSlug)
    .order('first_seen_at', { ascending: false })
    .limit(8);

  const { data: breach } = instRow
    ? await sb.from('breach_status').select('label, notes').eq('institution_id', instRow.id)
    : { data: [] };

  const actorNames = new Set<string>();
  for (const e of events ?? []) {
    if (e.actor_name) actorNames.add(e.actor_name);
  }

  return {
    institution_slug: institutionSlug,
    institution_name: instRow?.name ?? institutionSlug,
    related_events: events ?? [],
    breach_labels: (breach ?? []).map((b) => ({ label: b.label, notes: b.notes })),
    actors: [...actorNames],
  };
}

export async function compareSources(
  institutionSlug: string,
  claimSummary: string,
): Promise<CompareSourcesResult> {
  const ctx = await searchOSINT(institutionSlug);
  const labels = ctx.breach_labels.map((b) => b.label);
  const hasConfirmed = labels.includes('confirmed');
  const hasStrong = labels.includes('strong_evidence') || hasConfirmed;
  const claimLower = claimSummary.toLowerCase();
  const mentionsBreach = claimLower.includes('brecha') || claimLower.includes('expos') || claimLower.includes('credencial');

  const notes: string[] = [];
  if (ctx.related_events.length) {
    notes.push(`${ctx.related_events.length} evento(s) previos en registro interno`);
  }
  if (labels.length) {
    notes.push(`breach_status: ${labels.join(', ')}`);
  } else {
    notes.push('sin breach_status previo');
  }

  const aligned = mentionsBreach ? hasStrong || ctx.related_events.some((e) => e.status === 'published') : true;

  return {
    institution_slug: institutionSlug,
    labels_found: labels,
    aligned,
    notes,
  };
}
