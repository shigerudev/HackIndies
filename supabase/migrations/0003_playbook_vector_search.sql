-- Add pgvector RPC function for semantic playbook search
-- Requires: vector extension (already in 0001_init.sql)

CREATE OR REPLACE FUNCTION match_playbooks(
  query_embedding extensions.vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  slug text,
  title_es text,
  body_md text,
  effort_hours numeric,
  cost_estimate_usd numeric,
  tags text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.title_es,
    p.body_md,
    p.effort_hours,
    p.cost_estimate_usd,
    p.tags,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM playbooks p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) >= match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_playbooks IS
'Semantic search over playbooks using cosine distance on pre-computed embeddings.';