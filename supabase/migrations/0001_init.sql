-- NOMAD Centinela — schema inicial (Fase 0)
-- Datos sintéticos únicamente en seed.sql

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Instituciones públicas (dominios ofuscados)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GT',
  domain_obfuscated TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Actores de amenaza (referencia pública, nombres de reportes OSINT)
CREATE TABLE IF NOT EXISTS actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  techniques TEXT[] NOT NULL DEFAULT '{}',
  countries TEXT[] NOT NULL DEFAULT '{}',
  operations_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eventos de exposición detectados (metadatos, sin credenciales)
CREATE TABLE IF NOT EXISTS exposure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES actors(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('osint_feed', 'hibp', 'public_report', 'make_webhook')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  malware_family TEXT,
  credentials_count INT NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
  title TEXT NOT NULL,
  summary TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exposure_events_institution ON exposure_events(institution_id);
CREATE INDEX idx_exposure_events_status ON exposure_events(status);
CREATE INDEX idx_exposure_events_severity ON exposure_events(severity);

-- Estado de brecha por institución
CREATE TABLE IF NOT EXISTS breach_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  event_id UUID REFERENCES exposure_events(id) ON DELETE SET NULL,
  label TEXT NOT NULL CHECK (label IN ('confirmed', 'strong_evidence', 'claimed')),
  evidence_url TEXT,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Playbooks de remediación (RAG en Fase 1)
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  body_md TEXT NOT NULL,
  effort_hours NUMERIC(4,1) NOT NULL DEFAULT 1,
  cost_estimate_usd NUMERIC(8,2) NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  embedding extensions.vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revisiones human-in-the-loop
CREATE TABLE IF NOT EXISTS hitl_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES exposure_events(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_more_info')),
  comment TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trazas de agentes (auditoría)
CREATE TABLE IF NOT EXISTS agent_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  run_id TEXT NOT NULL,
  event_id UUID REFERENCES exposure_events(id) ON DELETE SET NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  tools_called JSONB NOT NULL DEFAULT '[]',
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_traces_event ON agent_traces(event_id);

-- Alertas ciudadanas (k-anonymity: solo prefijo de hash)
CREATE TABLE IF NOT EXISTS citizen_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash_prefix TEXT NOT NULL,
  event_id UUID REFERENCES exposure_events(id) ON DELETE SET NULL,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citizen_alerts_prefix ON citizen_alerts(hash_prefix);

-- RLS: lectura pública anon para desarrollo; escritura solo service_role
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exposure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitl_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_institutions" ON institutions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_actors" ON actors FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_events" ON exposure_events FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_breach" ON breach_status FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_playbooks" ON playbooks FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_hitl" ON hitl_reviews FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_traces" ON agent_traces FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_alerts" ON citizen_alerts FOR SELECT TO anon USING (true);

-- Vistas útiles para API
CREATE OR REPLACE VIEW v_events_detail AS
SELECT
  e.id,
  e.title,
  e.summary,
  e.severity,
  e.status,
  e.malware_family,
  e.credentials_count,
  e.first_seen_at,
  e.source_type,
  e.payload,
  i.slug AS institution_slug,
  i.name AS institution_name,
  i.domain_obfuscated,
  a.name AS actor_name
FROM exposure_events e
JOIN institutions i ON i.id = e.institution_id
LEFT JOIN actors a ON a.id = e.actor_id;
