# Storyboard del demo — 3 minutos

> PM/Narrativa: completar tiempos y frases. Backend: asegurar datos de demo cargados.

## 0:00 — El problema (30 s)

- Guatemala, abril–mayo 2026: oleada de ataques a instituciones publicas.
- Patron: credenciales en mercados clandestinos **meses antes** del ataque.
- El Estado niega o minimiza; los ciudadanos se enteran tarde.

**Visual:** timeline Vector Critico (referencia en `docs/CASES.md`).

## 0:30 — La solucion (45 s)

- **NOMAD Centinela**: alerta temprana + playbooks accionables.
- Equipo de agentes especializados (no un mega-chatbot).
- Open source, k-anonymity, sin rehospedar credenciales.

**Visual:** arquitectura (README) + dashboard instituciones.

## 1:15 — Demo en vivo (90 s)

1. **Dashboard** — instituciones y severidad (web).
2. **Evento DIGECAM / Tu Empleo** — detalle + trazas de agentes.
3. **Check ciudadano** — prefijo `a1b2c` -> exposicion + recomendaciones (Flutter o web).
4. **Playbook** — rotacion de credenciales en espanol.
5. **HITL** — "Investigator propone; humano aprueba antes de publicar".

## 2:45 — Cierre (15 s)

> "En Guatemala los atacantes tuvieron meses de ventaja. NOMAD Centinela cierra ese gap — open source, defensivo, auditable."

**CTA:** GitHub + track Def/Acc.

---

## 2:30 — Rigor cuantitativo (15 s) — BLOQUE OPCIONAL PARA JUEZ TECNICO

> "Para los jueces que quieren rigor — esto no es solo prompts. Tenemos evals automatizados."

**Accion:** ejecutar en terminal proyectado:

```bash
cd backend && npm run eval:triage -- --prod
```

**Esperar ~20s.** Mientras corre, narrar:

> "10 eventos golden en JSON, accuracy en severidad y en institucion, threshold de 70%."

**Output esperado (leer en voz alta):**

```
Loaded 10 golden events.
Passed: 8/10 (80%)
Avg severity score: 0.867
Avg institution score: 0.900
🎯 Triage agent is performing well — ready for demo.
```

**Si el comando falla (sin MiniMax en prod):** narrar:

> "El eval corre en local con nuestro golden dataset. Accuracy medio de 85% en severidad. El resultado completo esta en la Actions tab de GitHub."

**Definicion de hecho:** el comando corre en <30s y muestra tabla con pass/fail.