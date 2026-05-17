'use client';

import { Fragment, useState } from 'react';
import {
  Webhook,
  GitBranch,
  Activity,
  Search,
  Hand,
  ShieldCheck,
  Newspaper,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

type Agent = { Icon: LucideIcon; name: string; desc: string; gate?: boolean };

const AGENTS: Agent[] = [
  {
    Icon: Webhook,
    name: 'Webhook',
    desc: 'Make.com recibe la señal OSINT (mercado de credenciales, feed externo) y la pasa al backend con firma.',
  },
  {
    Icon: GitBranch,
    name: 'Router',
    desc: 'Clasifica la intención del payload (ciudadano vs. defensor) y decide qué agentes invocar a continuación.',
  },
  {
    Icon: Activity,
    name: 'Triage',
    desc: 'Asigna severidad y sector (defensa, salud, educación). Sin LLM si la heurística estructurada alcanza.',
  },
  {
    Icon: Search,
    name: 'Investigator',
    desc: 'Verifica contra fuentes OSINT internas. Etiqueta: confirmed / strong_evidence / claimed. Marca hitl_required.',
  },
  {
    Icon: Hand,
    name: 'HITL',
    gate: true,
    desc: 'Revisor humano aprueba o rechaza. Bloquea publicación automática. Cada decisión queda trazada en hitl_reviews.',
  },
  {
    Icon: ShieldCheck,
    name: 'Defender',
    desc: 'Genera briefing técnico: 3–5 pasos con effort_hours y cost_estimate_usd, vinculados al playbook.',
  },
  {
    Icon: Newspaper,
    name: 'Narrative',
    desc: 'Borrador en español estilo informativo, con citas y fuentes. Queda en needs_review hasta firma del periodista.',
  },
  {
    Icon: Smartphone,
    name: 'Citizen',
    desc: 'Chat ciudadano con respuestas k-anónimas. Recomendaciones genéricas (rotar, 2FA, alertas) sin tocar el correo entero.',
  },
];

export function Architecture() {
  const [open, setOpen] = useState<number | null>(null);
  const flow = AGENTS.slice(0, 5);
  const fan = AGENTS.slice(5);

  return (
    <section className="section" id="arquitectura" aria-labelledby="arq-title">
      <div className="container">
        <Chip className="section-eyebrow">Cómo funciona</Chip>
        <h2 id="arq-title" className="section-title">
          Arquitectura de agentes especializados, no un mega-chatbot.
        </h2>
        <p className="section-lede">
          Cada agente tiene un alcance estrecho y trazable. Si uno falla, los demás no se
          contaminan; si uno mejora, lo evaluamos contra un dataset aislado.
        </p>

        <div className="agents-flow" aria-label="Diagrama de flujo entre agentes">
          <div className="agents-flow__row">
            {flow.map((a, i) => {
              const Icon = a.Icon;
              return (
                <Fragment key={a.name}>
                  <div className={`agent-node ${a.gate ? 'gate' : ''}`}>
                    <span className="lc">
                      <Icon size={16} strokeWidth={1.6} />
                    </span>
                    {a.name}
                  </div>
                  {i < flow.length - 1 && <div className="agent-arrow" aria-hidden="true" />}
                </Fragment>
              );
            })}
            <div className="agent-arrow" aria-hidden="true" />
            <div className="agents-fan">
              {fan.map((a) => {
                const Icon = a.Icon;
                return (
                  <div key={a.name} className="agent-node">
                    <span className="lc">
                      <Icon size={16} strokeWidth={1.6} />
                    </span>
                    {a.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="agent-list">
          {AGENTS.map((a, i) => {
            const Icon = a.Icon;
            const isOpen = open === i;
            return (
              <div
                key={a.name}
                className={`agent-item ${isOpen ? 'open' : ''} ${a.gate ? 'gate' : ''}`}
              >
                <button
                  type="button"
                  className="agent-item__head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="agent-item__icon">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  <span>{a.name}</span>
                  <span className="chev" aria-hidden="true">
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className="agent-item__body">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
