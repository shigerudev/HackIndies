# Make.com vía API — NOMAD Centinela

Toda la creación de escenarios se hace por API (no UI). Solo se toca la UI cuando se requiere autorizar **conexiones OAuth** (email, Slack, Gmail, etc.).

Script reproducible: [`backend/scripts/make-create-scenario.ts`](../backend/scripts/make-create-scenario.ts).

## 1. Token Make.com (us2)

1. Abrir https://us2.make.com/profile
2. Pestaña **API** → **Add token**
3. Nombre: `nomad-centinela-api`
4. Scopes mínimos (marcar todos):
   - `scenarios:read scenarios:write`
   - `hooks:read hooks:write`
   - `teams:read`
   - `connections:read`
5. **Copiar el token** (se muestra una sola vez).

Pegar en `backend/.env`:

```env
MAKE_API_TOKEN=TU_TOKEN
MAKE_API_ZONE=us2
MAKE_TEAM_ID=         # dejar vacío la primera vez; el script lo detecta y lo imprime
MAKE_WEBHOOK_SECRET=  # el mismo que ya tenés en Vercel
```

## 2. Escenarios creados

### Escenario 1 — Ingesta sintética (siempre)

| Campo | Valor |
|-------|-------|
| Trigger | Custom webhook (gateway) |
| Acción | HTTP → `POST https://nomad-centinela-api.vercel.app/api/webhooks/make/ingest` |
| Auth | Header `X-Nomad-Webhook-Secret` |
| Conexiones OAuth | Ninguna |
| Estado al crearse | Activo |

Crear:

```bash
cd backend
npm run make:create
```

El script imprime la **URL del trigger**. Para disparar el escenario (curl o desde Postman):

```bash
curl -X POST "URL_DEL_TRIGGER" \
  -H "Content-Type: application/json" \
  -d '{
    "institution_slug": "renap",
    "title": "[Sintético] Lote credenciales desde Make API",
    "summary": "Demo hackathon",
    "severity": "high",
    "external_id": "make-api-demo-001"
  }'
```

Resultado esperado: `exposure_events` nuevo en Supabase con `source_type=make_webhook`, `status=pending_review`.

### Escenario 2 — HITL notify (opcional, `--notify`)

| Campo | Valor |
|-------|-------|
| Trigger | Custom webhook |
| Acción | HTTP → POST a `NOTIFY_WEBHOOK_URL` (Discord o Slack incoming webhook) |
| Conexiones OAuth | Ninguna (si usás incoming webhook) |
| Estado al crearse | Activo |

Crear:

```bash
$env:NOTIFY_WEBHOOK_URL="https://discord.com/api/webhooks/..."
npm run make:create -- --notify
```

Disparar (cuando el backend marca un evento como `pending_review`, llama a este webhook):

```bash
curl -X POST "URL_TRIGGER_NOTIFY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "uuid",
    "title": "RENAP - lote credenciales",
    "severity": "high",
    "institution_name": "RENAP"
  }'
```

## 3. Email HITL (requiere UI una vez)

Para enviar email desde Make hay que crear primero una **conexión** OAuth/SMTP, y eso solo puede hacerse en la UI:

1. https://us2.make.com → Connections → **Add**
2. Elegir provider:
   - **Gmail** → OAuth con tu cuenta `@gmail.com`
   - **Microsoft 365 / Outlook** → OAuth
   - **Email (SMTP)** → host, puerto, user, pass
3. Guardar y **anotar el ID de la conexión** (aparece en la URL de Make: `/connections/{ID}`).
4. Pasar el ID al script en una próxima iteración (`make:create -- --email <connectionId>`).

> El script `make-create-scenario.ts` aún **no** crea el módulo email por defecto; lo agregaremos cuando me pases el ID de la conexión.

## 4. Notificación a frontend y Flutter

Make no notifica directo al navegador ni a apps móviles; lo correcto es:

- **Frontend (web)** — el dashboard ya consulta `/api/events?status=pending_review` con `cache: 'no-store'`. Para "notificación viva" basta con un `setInterval` que refresque cada N segundos, o agregar `/api/events/feed` con SSE en Fase 3.
- **Flutter** — push real requiere FCM (Firebase Cloud Messaging) o APNs. Fuera de scope para el hackathon. Alternativa: polling de `/api/citizen/check` cuando el ciudadano abre la app.

Ninguno necesita Make.

## 5. Comandos rápidos

```bash
cd backend

# Crear ingesta
npm run make:create

# Crear ingesta + notify (con NOTIFY_WEBHOOK_URL)
npm run make:create -- --notify

# Verificar webhook del backend desde el ingest creado
curl -X POST "URL_TRIGGER_INGESTA" \
  -H "Content-Type: application/json" \
  -d '{"institution_slug":"digecam","title":"[Sintético] smoke","external_id":"smoke-001"}'

# Confirmar que llegó a Supabase
npm run test:agents:prod
```
