# Diferenciador y Pitch — NOMAD Centinela

## Pitch de 30 segundos

> *"HIBP te dice si tu correo está expuesto, pero no ayuda al SOC del Estado.*
> *Spycloud lo hace, pero es cerrado, en inglés, B2B y caro.*
> *Vector Crítico cuenta la historia, pero es periodismo, no plataforma.*
> *Los CIRTs nacionales reaccionan tarde y opacamente.*
>
> *NOMAD Centinela es la primera plataforma open-source LATAM-first que une los cuatro mundos: ciudadano + defensor + periodista, con human-in-the-loop ético explícito en cada decisión publicable.*
>
> *Hoy, en este demo, en menos de un minuto, vas a ver el ciclo completo."*

**Tiempo:** 28–32s leyendo a voz natural. Una sola idea fuerza: *"unimos los cuatro mundos con HITL ético"*.

---

## Matriz comparativa

| | Open source | LATAM-first | Multi-stakeholder | HITL ético | Playbooks con costo/hora |
|---|:---:|:---:|:---:|:---:|:---:|
| **HIBP** | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Spycloud / Constella** | ✗ | ✗ | ✗ | ⚠︎ | ✗ |
| **Vector Crítico** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **CIRTs nacionales** | ✗ | ⚠︎ | ✗ | ⚠︎ | ✗ |
| **NOMAD Centinela** | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Frases de respuesta rápida (si el juez pregunta "esto ya existe")

1. **"HIBP no tiene vista defensor."** — No genera playbooks, no ayuda al SOC a responder.
2. **"Spycloud es cerrado y caro."** — El modelo de negocio no escala a instituciones públicas de países con débil moneda.
3. **"Vector Crítico no automatiza."** —periodismo de investigación, no alerta temprana accionable.
4. **"Los CIRTs son reactivos y opacos."** — No hay citizen-facing tool, no hay agentes, no hay HITL.
5. **"NOMAD es el primer OSS que cierra las cuatro brechas juntas."** — Por eso no existía antes: la fragmentación regulatoria LATAM + bajo incentivo comercial para incumbentes US = vacío que solo un proyecto open-source puede llenar.

---

## Por qué esto no se había hecho antes (pregunta de Moonshot)

La combinación de factores:
1. **Fragmentación regulatoria LATAM** — LGPD Brasil, Habeas Data Colombia, Ley de Protección de Datos Personales MX, cada país con su marco; imposible para un incumbente US hacer compliance país por país.
2. **Bajo incentivo comercial** — instituciones públicas LATAM tienen presupuestos pequeños; el modelo B2B de Spycloud/Recorded Future no funciona.
3. **Idioma y contexto** — los datasets de entrenamiento de HIBP/Spycloud están en inglés; las alertas deben llegar en español, con contexto deinfraestructura pública local (ministerios, rectorías, direcciones de identificación).
4. **Complejidad de orquestar agentes + HITL** — hasta la llegada de LLMs económicos (MiniMax) y frameworks como Vercel AI SDK, el costo de construir esto era prohibitivo.

**Estos cuatro factores juntos = oportunidad estructural que solo un equipo local, open-source y hackathon-driven podía empezar a resolver.**