-- NOMAD Centinela — SEED SINTÉTICO
-- Inspirado en reportes públicos (Vector Crítico, abril-mayo 2026).
-- TODOS los nombres, correos y DPI son FICTICIOS.

-- Actores (nombres de reportes OSINT públicos)
INSERT INTO actors (id, name, techniques, countries, operations_count) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'GordonFreeman', ARRAY['infostealer', 'credential_stuffing', 'sql_injection'], ARRAY['GT', 'SV', 'HN'], 12),
  ('a1000000-0000-4000-8000-000000000002', 'Dianna', ARRAY['ransomware', 'data_exfiltration'], ARRAY['GT', 'MX'], 8),
  ('a1000000-0000-4000-8000-000000000003', 'NemorisHacking', ARRAY['defacement', 'credential_sale'], ARRAY['GT'], 5),
  ('a1000000-0000-4000-8000-000000000004', 'Team L4TAMFUCKERS', ARRAY['claimed_breach', 'doxing'], ARRAY['LATAM'], 15),
  ('a1000000-0000-4000-8000-000000000005', 'Unknown Stealer Botnet', ARRAY['infostealer', 'log_marketplace'], ARRAY['GT'], 50)
ON CONFLICT (name) DO NOTHING;

-- Instituciones (8)
INSERT INTO institutions (id, slug, name, sector, country, domain_obfuscated) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'digecam', 'DIGECAM', 'defensa', 'GT', 'digecam[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000002', 'mintrab-tu-empleo', 'MINTRAB — Portal Tu Empleo', 'trabajo', 'GT', 'tuempleo[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000003', 'mspas', 'MSPAS — Ministerio de Salud', 'salud', 'GT', 'mspas[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000004', 'mineduc', 'MINEDUC', 'educacion', 'GT', 'mineduc[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000005', 'renap', 'RENAP', 'identidad', 'GT', 'renap[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000006', 'sat', 'SAT — Superintendencia de Administración Tributaria', 'fiscal', 'GT', 'sat[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000007', 'pgn', 'Procuraduría General de la Nación', 'justicia', 'GT', 'pgn[.]gob[.]gt'),
  ('b1000000-0000-4000-8000-000000000008', 'covial', 'COVIAL — Unidad de Conservación Vial', 'transporte', 'GT', 'covial[.]gob[.]gt')
ON CONFLICT (slug) DO NOTHING;

-- Eventos de exposición (12)
INSERT INTO exposure_events (id, institution_id, actor_id, source_type, severity, malware_family, credentials_count, first_seen_at, status, title, summary, payload) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'public_report', 'critical', 'manual_exploit', 21700, '2025-06-15T08:00:00Z', 'published', 'Exposición previa detectada en inteligencia de amenazas', 'Señales de credenciales de empleados en mercados clandestinos meses antes del incidente público.', '{"vulnerabilities_documented": 14, "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'public_report', 'critical', NULL, 21700, '2026-04-09T14:30:00Z', 'published', 'Incidente confirmado — registro de armas', 'Brecha confirmada por la institución tras análisis independiente.', '{"records_weapons": 62000, "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'public_report', 'critical', NULL, 200000, '2026-04-26T10:00:00Z', 'published', 'Portal Tu Empleo — exfiltración masiva', 'API sin controles de acceso; currículos con metadatos personales sintéticos.', '{"size_gb": 40, "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 'public_report', 'high', 'ransomware', 0, '2026-04-13T09:00:00Z', 'published', 'MSPAS — ransomware en sistemas', 'Encriptación de archivos; sin filtración confirmada de datos sensibles.', '{"note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'public_report', 'high', NULL, 5000, '2026-04-30T16:00:00Z', 'published', 'MINEDUC — acceso no autorizado', 'Institución reportó base de datos íntegra; evidencia técnica independiente en revisión.', '{"note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004', 'osint_feed', 'high', 'infostealer', 40300, '2025-08-01T00:00:00Z', 'pending_review', 'RENAP — credenciales en mercado clandestino', 'Lote de credenciales ofrecido; institución negó brecha pública.', '{"price_usd": 10, "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000005', 'osint_feed', 'critical', 'redline', 258000, '2025-07-20T00:00:00Z', 'pending_review', 'SAT — superficie de riesgo acumulada', 'Usuarios y empleados en registros de inteligencia; sin brecha confirmada oficialmente.', '{"employees_exposed": 805, "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000007', NULL, 'public_report', 'medium', NULL, 120, '2026-04-28T11:00:00Z', 'approved', 'PGN — intento de acceso reportado', 'Negado por la institución; postura mejoró en auditoría externa.', '{"govscan_delta": "+19 pts", "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000008', NULL, 'public_report', 'low', NULL, 0, '2026-05-01T00:00:00Z', 'published', 'COVIAL — mejora post-crisis', 'Implementación de CSP y headers de seguridad.', '{"govscan_grade": "B", "note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004', 'osint_feed', 'high', NULL, 0, '2026-04-28T20:00:00Z', 'rejected', 'RENAP — afirmación de atacante sin evidencia suficiente', 'Rechazado tras revisión HITL.', '{"note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000004', 'osint_feed', 'medium', NULL, 0, '2026-04-28T21:00:00Z', 'pending_review', 'SAT — alerta de grupo en redes', 'Sin confirmación oficial.', '{"note": "synthetic"}'),
  ('e1000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005', 'hibp', 'medium', 'redline', 450, '2025-11-10T00:00:00Z', 'approved', 'MSPAS — empleados en lote infostealer', 'Credenciales de correo institucional en mercado; rotación no documentada.', '{"note": "synthetic"}')
ON CONFLICT (id) DO NOTHING;

-- Breach status
INSERT INTO breach_status (institution_id, event_id, label, evidence_url, confirmed_by, confirmed_at, notes) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'confirmed', 'https://vectorcritico.com/', 'MINDEF comunicado', '2026-04-10T00:00:00Z', 'synthetic reference'),
  ('b1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000003', 'confirmed', 'https://vectorcritico.com/', 'MINTRAB', '2026-04-27T00:00:00Z', 'synthetic reference'),
  ('b1000000-0000-4000-8000-000000000005', 'e1000000-0000-4000-8000-000000000006', 'claimed', NULL, NULL, NULL, 'Institución negó'),
  ('b1000000-0000-4000-8000-000000000006', 'e1000000-0000-4000-8000-000000000007', 'strong_evidence', 'https://cibercrisis.vectorcritico.com/', 'OSINT independiente', '2026-04-28T00:00:00Z', 'synthetic');

-- Playbooks (6) — embedding NULL en Fase 0
INSERT INTO playbooks (slug, title_es, body_md, effort_hours, cost_estimate_usd, tags) VALUES
  ('rotate-credentials', 'Rotación masiva de credenciales tras infostealer', E'## Pasos\n1. Identificar cuentas en el lote expuesto (metadatos only).\n2. Forzar reset de contraseña + revocar sesiones OAuth.\n3. Habilitar MFA en todos los accesos privilegiados.\n\n**Tiempo estimado:** 4-8 h para equipos < 50 personas.', 6, 0, ARRAY['infostealer', 'credentials']),
  ('enable-2fa', 'Habilitar 2FA en aplicaciones legacy', E'## Opciones\n- Proxy SAML/OIDC delante de la app legacy.\n- TOTP con app autenticadora para VPN.\n\n**Costo:** $0 con soluciones open source.', 3, 0, ARRAY['mfa', 'hardening']),
  ('csp-headers', 'Implementar CSP y headers de seguridad', E'## Nginx ejemplo\n```\nadd_header Content-Security-Policy "default-src ''self''";\nadd_header Strict-Transport-Security "max-age=31536000";\n```\n\nReferencia: mejora GovScan de D→B en instituciones que aplicaron CSP.', 1, 0, ARRAY['headers', 'web']),
  ('api-rate-limit', 'Rate limiting en APIs públicas', E'## Tu Empleo-style APIs\n- Limitar por IP + API key.\n- Validar auth en cada endpoint de datos personales.\n- WAF básico (Cloudflare free tier).', 2, 0, ARRAY['api', 'waf']),
  ('incident-comms', 'Comunicación de incidente a ciudadanos', E'## Plantilla\n1. Qué pasó (hechos confirmados).\n2. Qué datos NO almacenamos en claro.\n3. Pasos para la víctima: rotar contraseñas, monitoreo crediticio.\n\nEvitar negación sin evidencia técnica.', 2, 0, ARRAY['comms', 'legal']),
  ('stealer-response', 'Respuesta a compromiso por infostealer', E'## Checklist 24h\n- [ ] Aislar endpoint infectado\n- [ ] Rotar credenciales del usuario\n- [ ] Revisar reglas de correo reenviadas\n- [ ] Buscar persistencia en registro/autostart', 4, 500, ARRAY['endpoint', 'malware'])
ON CONFLICT (slug) DO NOTHING;

-- HITL reviews (4)
INSERT INTO hitl_reviews (event_id, reviewer, decision, comment, decided_at) VALUES
  ('e1000000-0000-4000-8000-000000000006', 'pm@nomad.security', 'approved', 'Evidencia OSINT consistente; publicar alerta agregada sin PII.', '2026-05-01T10:00:00Z'),
  ('e1000000-0000-4000-8000-000000000010', 'pm@nomad.security', 'rejected', 'Sin evidencia técnica independiente.', '2026-05-02T14:00:00Z'),
  ('e1000000-0000-4000-8000-000000000007', 'backend@nomad.security', 'needs_more_info', 'Esperar cruce con HIBP API en Fase 1.', '2026-05-03T09:00:00Z'),
  ('e1000000-0000-4000-8000-000000000012', 'pm@nomad.security', 'approved', 'Publicar playbook stealer-response.', '2026-05-04T11:00:00Z');

-- Agent traces (ejemplos)
INSERT INTO agent_traces (agent_name, run_id, event_id, input, output, tools_called, latency_ms) VALUES
  ('triage', 'run-001', 'e1000000-0000-4000-8000-000000000002', '{"raw_title": "DIGECAM breach"}', '{"severity": "critical", "institution_slug": "digecam"}', '[{"tool": "lookupDomain", "ms": 45}]', 320),
  ('investigator', 'run-002', 'e1000000-0000-4000-8000-000000000002', '{"sources": ["public_report"]}', '{"label": "confirmed", "confidence": 0.92}', '[{"tool": "compareSources", "ms": 120}]', 890),
  ('citizen', 'run-003', NULL, '{"query": "¿Qué hacer si mi correo apareció?"}', '{"answer": "Rotá contraseñas y activá 2FA."}', '[]', 150);

-- Citizen alerts (hash prefixes ficticios — SHA1 primeros 5 chars de emails de prueba)
INSERT INTO citizen_alerts (hash_prefix, event_id) VALUES
  ('a1b2c', 'e1000000-0000-4000-8000-000000000003'),
  ('d4e5f', 'e1000000-0000-4000-8000-000000000003'),
  ('f6a7b', 'e1000000-0000-4000-8000-000000000002');
