# HANDOFF — NOMAD Centinela

Documento de continuidad para nuevas sesiones de Cursor / Claude CLI.  
Actualizado tras conectar **Supabase**, **MiniMax** y **Make webhook** (sin Triage/SSE/RAG aún).

---

## Proyecto

| Campo | Valor |
|-------|--------|
| Nombre | **NOMAD Centinela** |
| Equipo | NOMAD security (backend, frontend, Flutter, PM) |
| Track | [Def/Acc — hack@latam](https://hack.indies.la/tracks/) |
| Repo | `c:\Users\hugow\Repos\HackIndies` |
| Propósito | Alerta temprana de exposición de credenciales en instituciones públicas LATAM (sin rehospedar PII) |

---

## Stack

| Capa | Tecnología |
|------|------------|
| API + agentes | Node.js, Fastify, Vercel AI SDK v5, Zod |
| DB | Supabase (Postgres 17 + pgvector) |
| LLM | MiniMax (`vercel-minimax-ai-provider`) |
| Orquestación | Make.com (webhook ingest) |
| Web | Next.js 15, Tailwind |
| Mobile | Flutter |

---

## Herramientas — estado de conexión

| Herramienta | Estado | Notas |
|-------------|--------|--------|
| **Supabase** | Conectado | Proyecto cloud **Nomada HackIndies**, ref `vjeqrhxfmaghpkkmjvaq` |
| **MiniMax** | Conectado | Chat ciudadano en `POST /api/agent/chat` → `mock: false` |
| **Make.com** | Webhook listo | `POST /api/webhooks/make/ingest` + `MAKE_WEBHOOK_SECRET`; ver `docs/MAKE-CONNECT.md` |
| **Deploy** | Pendiente | Fase 3 (Vercel web + Fly/Railway backend) |
| **MCP Supabase (Cursor)** | Opcional | `SUPABASE_ACCESS_TOKEN` en entorno de usuario; ver `docs/MCP-SETUP.md` |
| **MCP v0 (Cursor)** | Configurado | `V0_API_KEY` + servidor `v0` en `.cursor/mcp.json`; ver `docs/MCP-SETUP.md` |

### Supabase

- Migración: `supabase/migrations/0001_init.sql` (PG17: `gen_random_uuid()`, `extensions.vector`)
- Seed sintético: `supabase/seed.sql` — **8** instituciones, **12** eventos
- Backend: `backend/.env` con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (no commitear)
- CLI enlazado: `supabase link` al ref anterior
- Probar: `cd backend && npm run test:supabase`

### MiniMax

- Env: `MINIMAX_API_KEY`, `MINIMAX_BASE_URL=https://api.minimax.io/v1`, `MINIMAX_MODEL=MiniMax-M2`
- Código: `backend/src/lib/minimax.ts`, `backend/src/lib/citizen-chat.ts`, `backend/src/agents/citizen/prompt.ts`
- Probar: `cd backend && npm run test:minimax`
- Health: `GET /api/health` → `minimax: true`

### Make.com

- Env: `MAKE_WEBHOOK_SECRET` (obligatorio), `MAKE_API_TOKEN` (opcional, Fase 2)
- Endpoints: `POST /api/webhooks/make/ingest`, `GET /api/webhooks/make/health`
- Código: `backend/src/routes/webhooks-make.ts`, `backend/src/lib/make-ingest.ts`
- Probar: `npm run test:make`, `docs/MAKE-CONNECT.md`
- Escenarios HITL: `docs/MAKE-SCENARIOS.md` (Fase 2)

---

## API v0.1 (`shared/openapi.yaml`)

| Método | Ruta | Estado |
|--------|------|--------|
| GET | `/api/health` | OK (+ flags supabase/minimax/make) |
| POST | `/api/webhooks/make/ingest` | OK — secret + Supabase |
| GET | `/api/webhooks/make/health` | OK — ping con secret |
| GET | `/api/institutions` | OK (Supabase o mock) |
| GET | `/api/events` | OK |
| GET | `/api/events/:id` | OK |
| POST | `/api/citizen/check` | OK — prefijos demo: `a1b2c`, `d4e5f`, `f6a7b` |
| GET | `/api/playbooks/:slug` | OK |
| POST | `/api/agent/chat` | OK — MiniMax real si hay key |

Backend: **http://localhost:3001** · Web: **http://localhost:3000** (`NEXT_PUBLIC_API_URL`)

---

## Fases — enfoque actual del equipo

**Política acordada:** conectar **todas las herramientas** antes de features grandes (Triage, Investigator, SSE, RAG, dashboard completo).

| Fase | Contenido | Estado |
|------|-----------|--------|
| 0 | Bootstrap monorepo | Hecho (cerrar checklist equipo opcional) |
| 1 | Agentes + UI | **Pospuesto** hasta terminar conexiones |
| 2 | Make + agentes restantes | Pendiente |
| 3 | Deploy + demo | Pendiente |

Ver detalle: `docs/PHASES.md`

---

## Comandos rápidos

```bash
# Backend
cd backend && npm install && npm run dev

# Tests
npm run test:supabase
npm run test:minimax
npm run test:make

# Supabase CLI (requiere SUPABASE_ACCESS_TOKEN)
npx supabase projects list
npx supabase db push
npx supabase db query --file supabase/seed.sql --linked

# Deploy script
# PowerShell: $env:SUPABASE_ACCESS_TOKEN=...; $env:SUPABASE_PROJECT_REF=vjeqrhxfmaghpkkmjvaq; .\scripts\supabase-deploy.ps1
```

---

## Estructura del repo

```
backend/     # API Node + MiniMax + Supabase client
web/         # Next.js placeholder (lista instituciones)
mobile/      # Flutter placeholder
supabase/    # migrations + seed
shared/      # openapi.yaml + types
docs/        # PHASES, CASES, DEMO-SCRIPT, SUPABASE-CONNECT, MCP-SETUP, este archivo
.cursor/rules/   # guardrails y convenciones
```

Convenciones: `AGENTS.md`, `README.md`

---

## Agentes (diseño — no todos implementados)

| Agente | Rol | HITL |
|--------|-----|------|
| Router | Enruta ciudadano / defensor / periodista | No |
| Triage | Severidad y metadatos | No |
| Investigator | Verifica OSINT | Sí |
| CitizenCommunicator | Chat ciudadano | Guardrails — **parcial (chat OK)** |
| DefenderBriefing | Playbooks | No |
| Narrative | Borradores PM | Sí |

---

## Reglas de oro (no negociar)

1. **No tocar lo ajeno** — sin pentest ni escaneo activo sin autorización.
2. **No rehospedar PII** — solo k-anonymity; nunca credenciales en claro.
3. **Lado del defensor** — si una feature facilita ataque, se descarta.
4. **No commitear** `.env`, `service_role`, PAT `sbp_`, keys MiniMax/Make.
5. **Lethal trifecta:** Investigator no combina datos privados + URLs no confiables + exfiltración.

---

## Seguridad — recordatorios

- Un PAT `sbp_...` se expuso en chat en una sesión anterior → **revocar al deploy** si aún activo.
- `service_role` solo en `backend/.env` en servidor.
- Web/Flutter **no** llaman a Supabase directamente; solo al backend.

---

## Prompt sugerido para chat nuevo

Copiar al iniciar sesión:

```markdown
Continúo NOMAD Centinela. Lee docs/HANDOFF.md, README.md, docs/PHASES.md y AGENTS.md.

Contexto: Supabase, MiniMax y Make webhook conectados. Siguiente: Triage/Investigator, SSE, RAG (Fase 1).

Trabajo en c:\Users\hugow\Repos\HackIndies. Respeta .cursor/rules/ y no commitees secretos.
```

---

## Referencias externas

- Crisis GT (contexto demo): [Vector Crítico](https://vectorcritico.com/las-claves-de-la-crisis-de-ciberseguridad-en-guatemala/)
- MiniMax AI SDK: https://platform.minimax.io/docs/api-reference/text-ai-sdk
- Supabase connect: `docs/SUPABASE-CONNECT.md`
