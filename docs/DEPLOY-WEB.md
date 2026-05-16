# Deploy Web — NOMAD Centinela (frontend)

Proyecto Vercel **separado** del backend API.

| Proyecto | Carpeta | URL ejemplo |
|----------|---------|-------------|
| API | `backend/` | https://nomad-centinela-api.vercel.app |
| Web | `web/` | https://nomad-centinela-web.vercel.app (al crear) |

## Variables de entorno (obligatorias)

En Vercel → proyecto web → **Settings → Environment Variables**:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://nomad-centinela-api.vercel.app` |

Sin barra final. Aplica a **Production** y **Preview**.

## Crear proyecto (frontend dev o backend deploy)

### Dashboard

1. [vercel.com/new](https://vercel.com/new) → importar repo Git `HackIndies`.
2. **Root Directory**: `web`
3. Framework: **Next.js** (auto)
4. Añadir `NEXT_PUBLIC_API_URL` antes del primer deploy.
5. Deploy.

### CLI

```bash
cd web
cp .env.example .env.local
# Editar .env.local si pruebas contra API local

npx vercel@latest link    # crear proyecto nomad-centinela-web
npx vercel@latest env add NEXT_PUBLIC_API_URL production
# pegar: https://nomad-centinela-api.vercel.app

npx vercel@latest deploy --prod
```

## Desarrollo local

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Páginas incluidas (Fase 1)

- `/` — dashboard (cola HITL + publicados + chat ciudadano)
- `/events/[id]` — detalle + botones Triage / Investigator

## Checklist antes de demo

- [ ] `https://TU-WEB.vercel.app` carga sin error de conexión al API
- [ ] Lista de eventos visible
- [ ] Chat ciudadano responde
- [ ] Detalle de evento abre desde una tarjeta

## Notas

- **No** poner `SUPABASE_SERVICE_ROLE` ni keys MiniMax en el proyecto web.
- El backend ya tiene CORS abierto (`origin: true`).

## Limitación conocida: chat SSE en producción

El handler serverless de Vercel (`backend/api/index.ts`) usa `app.inject()` de Fastify, que **bufferea** la respuesta. Por eso `POST /api/agent/chat?stream=true` no entrega tokens en vivo en prod.

Solución actual: el backend detecta `process.env.VERCEL === '1'` y **fuerza JSON** (no SSE). El componente `web/src/components/CitizenChat.tsx` ya tiene fallback: si el stream no produce chunks, vuelve a llamar sin `?stream=true` y muestra la respuesta completa.

Lo que verá el frontend dev en prod:
- Network: 1 request POST a `/api/agent/chat` (sin querystring), respuesta JSON.
- UX: respuesta completa de golpe (sin typing), pero funcional.

Para SSE real en prod, opciones (Fase 3):
- Migrar `/api/agent/chat` a Vercel Edge Runtime (`runtime: 'edge'`) con `streamText().toTextStreamResponse()`.
- Mover solo el chat a un endpoint Next.js dentro de `web/` con `runtime: 'edge'`.
- Usar otro provider (Cloudflare Workers, Fly) para el chat.
