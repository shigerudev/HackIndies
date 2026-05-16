import { getSupabase } from './supabase.js';
import { hasSupabase } from './env.js';
import { MOCK_PLAYBOOKS } from '../data/mock.js';
import type { Playbook } from '../../../shared/types/api.js';

export async function searchPlaybooks(query: string, limit = 5): Promise<Playbook[]> {
  const q = query.trim();
  if (!q) return [];

  if (!hasSupabase()) {
    const lower = q.toLowerCase();
    return Object.values(MOCK_PLAYBOOKS)
      .filter(
        (p) =>
          p.title_es.toLowerCase().includes(lower) ||
          p.body_md.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.includes(lower)),
      )
      .slice(0, limit);
  }

  const sb = getSupabase()!;
  const { data, error } = await sb
    .from('playbooks')
    .select('slug, title_es, body_md, effort_hours, cost_estimate_usd, tags')
    .textSearch('search_vector', q, { type: 'websearch', config: 'spanish' })
    .limit(limit);

  if (error) {
    const { data: fallback } = await sb
      .from('playbooks')
      .select('slug, title_es, body_md, effort_hours, cost_estimate_usd, tags')
      .or(`title_es.ilike.%${q}%,body_md.ilike.%${q}%`)
      .limit(limit);
    return (fallback ?? []) as Playbook[];
  }

  return (data ?? []) as Playbook[];
}
