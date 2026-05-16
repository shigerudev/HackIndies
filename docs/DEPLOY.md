# Deploy — NOMAD Centinela (sin Railway)

Stack acordado: **Supabase cloud** + **Vercel** (API backend ahora; web cuando frontend cierre UI).

## 1. Migración `0002_playbook_search` (FTS playbooks)

El MCP Supabase en Cursor requiere `SUPABASE_ACCESS_TOKEN` en variables de usuario.

**Opción A — PowerShell + CLI**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"  # https://supabase.com/dashboard/account/tokens
$env:SUPABASE_PROJECT_REF = "vjeqrhxfmaghpkkmjvaq"
cd c:\Users\hugow\Repos\HackIndies
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
npx supabase db push
```

**Opción B — SQL Editor** (Dashboard → SQL)

Pegar el contenido de `supabase/migrations/0002_playbook_search.sql` y ejecutar.

**Verificar**

```bash
cd backend
curl "http://127.0.0.1:3001/api/playbooks/search?q=infostealer"
```

Debe devolver playbooks (2+ con seed).

---

## 2. Deploy API backend en Vercel

Carpeta de deploy: **`backend/`** (proyecto Vercel separado del frontend).

### Crear proyecto Vercel (una vez)

1. [vercel.com](https://vercel.com) → **Add New Project** → importar repo Git.
2. **Root Directory**: `backend`
3. Framework Preset: **Other**
4. Build Command: `npm run build` (opcional; la función `api/index.ts` se compila sola)
5. Output: dejar default (serverless)

O con CLI:

```bash
npm i -g vercel
cd backend
vercel login
vercel
```

### Variables de entorno (Vercel → Project → Settings → Environment Variables)

| Variable | Obligatorio | Notas |
|----------|-------------|--------|
| `SUPABASE_URL` | Sí | Dashboard Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | **Solo servidor** — nunca en web |
| `MINIMAX_API_KEY` | Sí | Chat + agentes |
| `MINIMAX_BASE_URL` | Sí | `https://api.minimax.io/v1` |
| `MINIMAX_MODEL` | No | Default `MiniMax-M2` |
| `MAKE_WEBHOOK_SECRET` | Sí | Mismo que en Make.com |
| `LLM_TIMEOUT_MS` | No | Default `45000` |

### Probar producción

```bash
curl https://TU-PROYECTO.vercel.app/api/health
```

Esperado: `supabase: true`, `minimax: true`, `make_webhook: true`.

Make.com: URL del webhook → `https://TU-PROYECTO.vercel.app/api/webhooks/make/ingest`

---

## 3. Web (frontend dev)

Cuando el dev de web termine UI en `web/`:

1. Proyecto Vercel **aparte** con Root Directory `web`.
2. Variable: `NEXT_PUBLIC_API_URL=https://TU-PROYECTO-BACKEND.vercel.app`
3. Deploy desde su rama o la tuya.

---

## 4. Checklist backend (local antes de deploy)

```bash
cd backend
npm install
npm run lint
npm run test:supabase
npm run test:agents
npm run dev
```

---

## MCP en Cursor

| MCP | Uso en deploy |
|-----|----------------|
| **Supabase** | `db push` / SQL si hay `SUPABASE_ACCESS_TOKEN` |
| **Vercel** | Docs, listar proyectos, `deploy_to_vercel` desde repo enlazado |
