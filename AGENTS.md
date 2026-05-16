# AGENTS.md — NOMAD Centinela

Convenciones del monorepo para humanos y asistentes de IA.

## Estructura

| Carpeta | Responsable | Propósito |
|---------|-------------|-----------|
| `backend/` | Backend dev | API Node, agentes, tools |
| `web/` | Frontend dev | Dashboard Next.js |
| `mobile/` | Flutter dev | App ciudadana |
| `supabase/` | Backend dev | Migraciones y seed |
| `shared/` | Todos | OpenAPI + tipos compartidos |
| `docs/` | PM + todos | Fases, demo, casos |

## Contrato API

- Fuente de verdad: [`shared/openapi.yaml`](shared/openapi.yaml) v0.1
- Cambios breaking requieren bump de versión y aviso en `#api-changes`
- Web y Flutter **no** llaman a Supabase directamente; solo al backend

## Agentes (backend)

| Agente | Rol | HITL |
|--------|-----|------|
| Router | Clasifica usuario y enruta | No |
| Triage | Severidad y metadatos de evento | No |
| Investigator | Verifica fuentes OSINT | Sí (antes de confirmar) |
| CitizenCommunicator | Chat ciudadano | Output guardrails |
| DefenderBriefing | Playbooks técnicos | No |
| Narrative | Borradores para PM | Sí (post-proceso) |

## Comandos útiles

```bash
# Raíz
npm install          # workspaces (si aplica)

# Backend
cd backend && npm install && npm run dev

# Web
cd web && npm install && npm run dev

# Supabase local
npx supabase start
npx supabase db reset   # aplica migrations + seed

# Tipos (cuando Supabase esté vinculado)
cd backend && npm run gen:types
```

## Fases

Ver [`docs/PHASES.md`](docs/PHASES.md). Trabajar solo en la fase activa acordada por el equipo.
