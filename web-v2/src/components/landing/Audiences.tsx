import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { setRoleFromQuery } from '@/lib/actions';
import type { Role } from '@/lib/roles-meta';
import { ROLE_META } from '@/lib/roles-meta';
import type { ReactNode } from 'react';

function CitizenMock(): ReactNode {
  return (
    <div className="mock mock-citizen">
      <span className="audience__role">Ciudadano</span>
      <div className="phone-frame">
        <div className="ph-title">¿Mi correo fue expuesto?</div>
        <div className="ph-q">Ingresá tu correo. Nunca sale del dispositivo.</div>
        <div className="ph-input">empleado@institucion.gob.gt</div>
        <div className="ph-q" style={{ marginTop: 10 }}>
          Enviamos solo:{' '}
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--brand-cyan)' }}>
            a1b2c
          </span>
        </div>
        <div className="ph-resp">
          <div className="l1">1 coincidencia parcial</div>
          <div className="l2">Rotá tu contraseña + activá 2FA. Revisá alertas bancarias 30 d.</div>
        </div>
      </div>
    </div>
  );
}

function DefenderMock() {
  return (
    <div className="mock mock-defender">
      <span className="audience__role">Defensor</span>
      <div className="head">
        <span className="lbl">Cola HITL</span>
        <span className="count">3 pendientes</span>
      </div>
      <div className="row">
        <div className="t">Credenciales DIGECAM en mercado</div>
        <div className="sev crit">Crit</div>
      </div>
      <div className="row">
        <div className="t">Reseteos sospechosos · MINTRAB</div>
        <div className="sev high">High</div>
      </div>
      <div className="row">
        <div className="t">Listado parcial · Institución A</div>
        <div className="sev med">Med</div>
      </div>
    </div>
  );
}

function JournalistMock() {
  return (
    <div className="mock mock-journalist">
      <span className="audience__role">Periodista</span>
      <div className="doc">
        <div className="ttl">Ventana de 7 meses: la exposición que nadie usó</div>
        <div className="lns">
          <div className="ln med" />
          <div className="ln" />
          <div className="ln med" />
          <div className="ln short" />
          <div className="ln" />
        </div>
        <div className="tag">needs_review</div>
      </div>
    </div>
  );
}

function ReviewerMock() {
  return (
    <div className="mock mock-reviewer">
      <span className="audience__role">Revisor</span>
      <div className="card-mini">
        <div className="t">Evento #e_004 — strong_evidence</div>
        <div className="m">severity: critical · sector: defensa</div>
      </div>
      <div className="actions">
        <button className="ok" type="button">Aprobar</button>
        <button className="ko" type="button">Rechazar</button>
      </div>
    </div>
  );
}

const AUDIENCES: Array<{
  Mock: () => ReactNode;
  title: string;
  role: Role;
  what: string;
  why: string;
}> = [
  {
    Mock: CitizenMock,
    title: 'Ciudadano',
    role: 'ciudadano',
    what: 'Abre la app móvil y verifica si su correo aparece en una brecha — sin enviarlo entero al servidor (solo los primeros 5 chars del SHA-1).',
    why: 'HIBP existe en inglés y solo es web. NOMAD es nativo, en español, con el contexto LATAM de Vector Crítico.',
  },
  {
    Mock: DefenderMock,
    title: 'Defensor / SOC institucional',
    role: 'defensor',
    what: 'Ve la cola HITL y los eventos por severidad. Genera briefings con effort_hours y cost_estimate_usd vinculados al playbook.',
    why: 'Spycloud cuesta USD 50k/año y está en inglés. NOMAD es gratis, en español, con playbooks adaptados a equipos pequeños.',
  },
  {
    Mock: JournalistMock,
    title: 'Periodista de investigación',
    role: 'periodista',
    what: 'Abre el caso emblema con timeline auditable. Genera borradores en español con fuentes citadas, estilo informativo.',
    why: 'Investigar credenciales en mercados clandestinos requiere feeds OSINT pagos. NOMAD entrega contexto sin tocar dumps reales.',
  },
  {
    Mock: ReviewerMock,
    title: 'Revisor humano / Editor responsable',
    role: 'revisor',
    what: 'Aprueba o rechaza cada evento desde /hitl. Decisiones registradas en hitl_reviews con autor, comentario y timestamp.',
    why: 'Las decisiones sobre brechas gubernamentales son sensibles. HITL ético = trazabilidad legal + diferenciación clave.',
  },
];

export function Audiences() {
  return (
    <section className="section" id="audiencias" aria-labelledby="aud-title">
      <div className="container">
        <Chip className="section-eyebrow">¿Para quién es?</Chip>
        <h2 id="aud-title" className="section-title">
          Cuatro audiencias. Una sola plataforma.
        </h2>
        <p className="section-lede">
          Cada audiencia tiene su propia vista, agente y workflow. NOMAD no es un producto
          genérico: es la intersección entre ciudadano, defensor y periodista — con el revisor
          humano siempre en el medio.
        </p>

        <div className="audiences__grid">
          {AUDIENCES.map(({ Mock, title, role, what, why }) => (
            <Card key={title} as="article" interactive className="audience">
              <div className="audience__mock">
                <Mock />
              </div>
              <div className="audience__body">
                <h3>{title}</h3>
                <p className="what">{what}</p>
                <p className="why">{why}</p>
                <div style={{ marginTop: 14 }}>
                  <form action={setRoleFromQuery}>
                    <input type="hidden" name="as" value={role} />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Entrar como {ROLE_META[role].label}
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
