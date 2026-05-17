import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

type Step = { when: string; text: ReactNode; last?: boolean };

const STEPS: Step[] = [
  {
    when: 'Mes 0',
    text: 'Credenciales aparecen en mercado clandestino (señal OSINT detectada por feed externo).',
  },
  {
    when: 'Mes 0 · +5 min',
    text: (
      <>
        <strong>Triage</strong> clasifica <code>severity: critical</code> · sector: defensa.
      </>
    ),
  },
  {
    when: 'Mes 0 · +30 min',
    text: (
      <>
        <strong>Investigator</strong> valida contra fuentes OSINT internas y marca{' '}
        <code>hitl_required: true</code>.
      </>
    ),
  },
  {
    when: 'Mes 0 · +1 h',
    text: (
      <>
        <strong>Revisor humano</strong> aprueba en <code>/hitl</code>. Decisión registrada en{' '}
        <code>hitl_reviews</code>.
      </>
    ),
  },
  {
    when: 'Mes 0 · +2 h',
    text: (
      <>
        <strong>Defender</strong> genera playbook: rotación 24 h, revisión de logs 60 d,
        notificación al CIRT GT.
      </>
    ),
  },
  {
    when: 'Mes 0 · +4 h',
    text: (
      <>
        <strong>Narrative</strong> genera borrador para medios independientes (queda en{' '}
        <code>needs_review</code>).
      </>
    ),
  },
  {
    when: 'Mes 7',
    text: (
      <>
        <strong>Confirmación oficial del ataque.</strong> Ventana ganada para defensores: 7
        meses.
      </>
    ),
    last: true,
  },
];

export function CaseDigecam() {
  return (
    <section className="section case" id="caso" aria-labelledby="caso-title">
      <div className="container">
        <div className="case__intro">
          <Chip className="section-eyebrow">Caso emblema · abril 2026</Chip>
          <h2 id="caso-title" className="section-title">
            <em>7 meses</em> de ventana ganada.
          </h2>
          <p className="section-lede">
            Las credenciales del personal de DIGECAM aparecieron en mercados clandestinos siete
            meses antes de la confirmación oficial del ataque. Así habría respondido NOMAD si
            hubiera estado en producción ese día.
          </p>
        </div>

        <div className="timeline-v" aria-label="Línea de tiempo del caso DIGECAM">
          {STEPS.map((s, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            return (
              <div
                key={i}
                className={`timeline-v__item ${side} ${s.last ? 'last' : ''}`}
              >
                <div className="node" />
                <div className="when">{s.when}</div>
                <div className="what">{s.text}</div>
              </div>
            );
          })}
        </div>

        <div className="case__cta">
          <Button href="/casos/digecam" variant="secondary" size="lg">
            Leer el caso completo
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
