# Script narrativo — Demo en vivo, 60 segundos

> Quien presenta lo lee. Cronómetro en mano. Sin improvisation.

## Pre-demo checklist (antes de subir al escenario)

1. `curl https://nomad-centinela-api.vercel.app/api/health` → `mock: false` ✓
2. `https://web-shigerudev.vercel.app/demo` abierto en ventana A
3. `https://web-shigerudev.vercel.app/casos/digecam` abierto en ventana B
4. Ventana C: `/playground` con la matriz comparativa visible
5. Hacer un hit a `/api/health` 2 minutos antes (evita cold start)

---

## 0:00 — El problema (10s)

> "Guatemala, abril 2026. Una oleada de ataques a instituciones del Estado — DIGECAM, MINTRAB, MSPAS.
> Lo más grave: las credenciales ya estaban en mercados clandestinos **meses antes**."

**Acción:** señalar las stats en la página `/casos/digecam` (7 meses de ventaja, 21,700 credenciales).

---

## 0:10 — La solución (8s)

> "NOMAD Centinela cierra ese gap. Plataforma open-source que detecta señales OSINT,
> clasifica con agentes, y un humano revisa antes de publicar — nunca antes."

**Acción:** mostrar la matriz comparativa en `/playground` (última sección, scroll rápido).

---

## 0:18 — El pipeline (25s)

> "Lo que van a ver ahora es el ciclo completo en menos de un minuto.
> Un solo click en DIGECAM."

**Acción:** click en botón "DIGECAM — Abril 2026" en `/demo`.

> Mientras carga, narrar cada paso conforme se iluminan:
> "Ingest: el evento entra al sistema y se valida que no tenga PII.
> Triage: el agente clasifica severidad en ~320 milisegundos.
> Investigator: verifica contra fuentes OSINT y genera recomendación.
> HITL: el sistema pide aprobación humana antes de publicar."

Esperar a que aparezcan los resultados.

> "Severity: **critical**. Confianza: 83%. Recomendación: approve for review.
> Y abajo: **humano debe aprobar antes de publicar** — eso es el HITL."

**Acción:** mostrar los run IDs y el badge `replay: true` explicando que se cacheó la respuesta.

---

## 0:43 — Por qué existe (10s)

> "HIBP no tiene vista defensor. Spycloud es cerrado y en inglés. CIRTs son lentos y opacos.
> Ninguno tenía playbooks en español con costo estimado para equipos de 20 personas."

**Acción:** scroll hasta la matriz comparativa para recordarlo.

---

## 0:53 — El cierre (7s)

> "NOMAD Centinela: open source, LATAM-first, multi-stakeholder, HITL ético.
> 7 meses de ventaja para defensores. Los enlaces en el playground."

---

## Comandos rápidos del demo

```bash
# Verificar API viva
curl https://nomad-centinela-api.vercel.app/api/health

# Ver presets
curl https://nomad-centinela-api.vercel.app/api/dev/presets

# Trigger DIGECAM preset (backend con DEMO_MODE=true)
curl -X POST https://nomad-centinela-api.vercel.app/api/dev/run-preset/digecam-2026-04

# Resetear DIGECAM para repetir
curl -X POST https://nomad-centinela-api.vercel.app/api/dev/reset-event/e1000000-0000-4000-8000-000000000002
```

## Si MiniMax falla durante el demo

El `/demo` muestra banner `mock` en la respuesta — eso **no** descalifica. Narrar:

> "El fallback mock muestra la misma estructura de respuesta.
> Con MiniMax real, las labels y confidencias serían distintas."

## Si el link de Vercel no carga

Tener el video de backup listo en `/demo` (grabar con OBS antes del evento, 90s, narrado).
No intentar recuperar durante el demo. Usar el video y responder preguntas después.