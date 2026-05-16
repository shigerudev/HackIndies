-- FTS para RAG de playbooks (Fase 1) — embeddings opcionales en columna existente

ALTER TABLE playbooks
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(title_es, '') || ' ' || coalesce(body_md, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_playbooks_search ON playbooks USING GIN (search_vector);
