import { getSupabase } from './supabase.js';
import { hasSupabase } from './env.js';
import { MOCK_PLAYBOOKS } from '../data/mock.js';
import type { Playbook } from '../types/api.js';

export async function searchPlaybooksVector(query: string, limit = 5): Promise<Playbook[]> {
  if (!hasSupabase()) return [];

  const sb = getSupabase()!;

  // Embed the query using MiniMax if available
  let queryEmbedding: number[] | null = null;
  try {
    const { embedQuery } = await import('./embeddings.js');
    queryEmbedding = await embedQuery(query);
  } catch {
    // embeddings.js not available or MiniMax not set — skip vector search
    return [];
  }

  const { data, error } = await sb.rpc('match_playbooks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) {
    console.warn('[playbook-rag] vector search failed, falling back to FTS:', error.message);
    return [];
  }

  return (data ?? []) as Playbook[];
}

export async function searchPlaybooks(query: string, limit = 5, mode: 'fts' | 'vector' | 'auto' = 'auto'): Promise<Playbook[]> {
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

  // Auto-mode: try vector first, fall back to FTS
  if (mode === 'auto' || mode === 'vector') {
    const vectorResults = await searchPlaybooksVector(q, limit);
    if (vectorResults.length > 0) return vectorResults;
    if (mode === 'vector') return []; // explicit vector mode, no fallback
  }

  // FTS fallback
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
