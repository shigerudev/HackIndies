# Fases de desarrollo — NOMAD Centinela

Trabajar **solo en la fase activa** acordada por el equipo para evitar sobrecarga.

## Fase 0 — Bootstrap (4–6 h) ✅ objetivo actual

**Entregables**

- [x] Monorepo con `backend/`, `web/`, `mobile/`, `supabase/`, `shared/`
- [x] Schema + seed sintético en Supabase
- [x] API v0.1 (`shared/openapi.yaml`)
- [x] Backend con modo mock (sin Supabase) y modo Supabase
- [x] Web placeholder: lista de instituciones
- [x] Flutter placeholder: lista de instituciones
- [x] Cursor rules + MCP Supabase
- [x] README + documentación

**Checklist de cierre**

- [ ] `cd backend && npm install && npm run dev`
- [ ] `curl http://localhost:3001/api/institutions` → 8 registros
- [ ] `cd web && npm install && npm run dev` → lista visible
- [ ] `cd mobile && flutter pub get && flutter run` → lista visible
- [ ] Supabase: `npx supabase db reset` (opcional si hay CLI)
- [ ] Equipo leyó README y firmó en `docs/team-acks.md`

---

## Fase 1 — Backend real + UI base (12–18 h)

- Triage + Investigator agents (MiniMax)
- RAG sobre playbooks (pgvector)
- Dashboard: timeline doble, detalle de evento
- Flutter: check ciudadano (`POST /api/citizen/check`)
- Chat SSE real (`POST /api/agent/chat`)

---

## Fase 2 — Agentes + Make (12–18 h)

- Citizen, Defender, Narrative agents
- Escenarios Make: ingesta + HITL Slack/email
- Guardrails input/output
- Panel HITL en web

---

## Fase 3 — Polish + demo (8–12 h)

- Evals (PM): failure modes + golden dataset
- Deploy: Vercel (web) + Fly/Railway (backend)
- Ensayo pitch 3 min (`docs/DEMO-SCRIPT.md`)
