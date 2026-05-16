# Conectar Make.com — webhooks

Sin MCP oficial. Make llama al backend por HTTP; el backend persiste en Supabase.

## 1. Secret compartido

Generá un secret (mín. 16 caracteres) y ponelo en `backend/.env`:

```env
MAKE_WEBHOOK_SECRET=tu-secret-largo-aleatorio
```

Probar:

```bash
cd backend
npm run test:make
npm run dev
npm run test:make -- --ping
```

`GET /api/health` debe mostrar `make_webhook: true`.

## 2. Escenario Make (mínimo)

1. [Make.com](https://www.make.com) → **Create scenario**
2. Trigger manual o **Webhooks → Custom webhook** (si Make inicia el flujo)
3. Para **enviar al Centinela**, añadí **HTTP → Make a request**:
   - **URL**: `https://TU_BACKEND/api/webhooks/make/ingest` (local: `http://127.0.0.1:3001/...` con túnel ngrok/cloudflared)
   - **Method**: POST
   - **Headers**:
     - `Content-Type: application/json`
     - `X-Nomad-Webhook-Secret`: mismo valor que `MAKE_WEBHOOK_SECRET`
   - **Body** (JSON):

```json
{
  "institution_slug": "digecam",
  "title": "[Sintético] Señal OSINT desde Make",
  "summary": "Demo hackathon — sin credenciales ni emails",
  "severity": "high",
  "credentials_count": 0,
  "external_id": "make-demo-001",
  "metadata": { "scenario": "ingest_v0" }
}
```

Slugs válidos (seed): `digecam`, `mintrab`, `mspas`, `mineduc`, `renap`, `sat`, `mp`, `congreso`.

## 3. Probar con curl

```bash
curl -s -X POST http://127.0.0.1:3001/api/webhooks/make/ingest \
  -H "Content-Type: application/json" \
  -H "X-Nomad-Webhook-Secret: TU_SECRET" \
  -d "{\"institution_slug\":\"digecam\",\"title\":\"[Sintético] curl test\",\"external_id\":\"curl-001\"}"
```

Respuesta esperada: `201` con `event_id`, `status: pending_review`, `mock: false` si Supabase está configurado.

Repetir el mismo `external_id` → `200` y `duplicate: true`.

## 4. Seguridad

- No enviar emails, contraseñas ni dumps; el API rechaza textos con `@`.
- `MAKE_API_TOKEN` (opcional) queda para escenarios salientes en Fase 2.
- Escenarios completos (HITL Slack/email): `docs/MAKE-SCENARIOS.md` (por crear en Fase 2).

## 5. Desarrollo local

Make cloud no alcanza `localhost`. Opciones:

- [ngrok](https://ngrok.com) / Cloudflare Tunnel → URL pública al puerto 3001
- Probar solo con `curl` hasta deploy del backend
