import { DIGECAM_TIMELINE, DIGECAM_STATS } from '@/lib/digecam-data';
import Link from 'next/link';

const TYPE_CONFIG = {
  osint: {
    dotColor: 'var(--sev-medium)',
    lineColor: 'rgba(127,177,196,0.35)',
    label: 'OSINT',
    pillClass: 'pill-sev pill-sev-medium',
    dateColor: 'var(--sev-medium)',
    borderAccent: 'rgba(127,177,196,0.18)',
  },
  public_report: {
    dotColor: 'var(--sev-high)',
    lineColor: 'rgba(212,164,90,0.35)',
    label: 'Reporte público',
    pillClass: 'pill-sev pill-sev-high',
    dateColor: 'var(--sev-high)',
    borderAccent: 'rgba(212,164,90,0.18)',
  },
  remediation: {
    dotColor: 'var(--status-ok)',
    lineColor: 'rgba(110,193,138,0.35)',
    label: 'Remediación',
    pillClass: 'pill-status pill-status-published',
    dateColor: 'var(--status-ok)',
    borderAccent: 'rgba(110,193,138,0.18)',
  },
};

function TimelineItem({
  item,
  index,
  isLast,
}: {
  item: (typeof DIGECAM_TIMELINE)[0];
  index: number;
  isLast: boolean;
}) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.osint;

  return (
    <div className="flex gap-5">
      {/* Spine */}
      <div className="flex flex-col items-center" style={{ minWidth: 20 }}>
        <div
          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
          style={{ background: cfg.dotColor, boxShadow: `0 0 0 3px ${cfg.borderAccent}` }}
        />
        {!isLast && (
          <div className="w-px flex-1 my-2" style={{ background: cfg.lineColor }} />
        )}
      </div>

      {/* Card */}
      <div
        className="flex-1 mb-6 panel"
        style={{ borderColor: cfg.borderAccent, background: 'rgba(255,255,255,0.025)' }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: cfg.dateColor, letterSpacing: '0.04em' }}
          >
            {item.date}
          </span>
          <span className={cfg.pillClass}>{cfg.label}</span>
        </div>

        <p
          className="font-semibold mb-1"
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}
        >
          {item.signal}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.55 }}>
          {item.note}
        </p>

        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ fontSize: 12, color: 'var(--sev-medium)', lineHeight: 1.55 }}>
            <span style={{ opacity: 0.5 }}>→ </span>
            {item.nomadAction}
          </p>
          <p
            className="mt-1 flex flex-wrap gap-x-3"
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}
          >
            <span>
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>agente: </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{item.agent}</span>
            </span>
            <span aria-hidden>·</span>
            <span>
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>fuente: </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{item.source}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CasosDigecamPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0a0a', color: 'rgba(255,255,255,0.87)' }}
    >
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 36px' }}>
          <p className="mb-4" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            <Link href="/playground" className="hover:text-white/65 transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>
              ← Casos
            </Link>
            <span className="ml-3 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 10 }}>Caso público</span>
          </p>

          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.1, color: 'rgba(255,255,255,0.95)', marginBottom: 10 }}>
            Caso DIGECAM
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.6 }}>
            Dirección General de Gestión del Catastro Nacional
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* KPI stats */}
        <section className="grid grid-cols-3 gap-3 mb-10">
          <div className="kpi text-center" style={{ alignItems: 'center' }}>
            <div className="kpi-value" style={{ fontSize: 36, color: 'var(--sev-medium)' }}>
              {DIGECAM_STATS.monthsOfAdvantage}
            </div>
            <div className="kpi-label">meses de ventaja</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>para defensores</div>
          </div>
          <div className="kpi text-center" style={{ alignItems: 'center' }}>
            <div className="kpi-value" style={{ fontSize: 36, color: 'var(--sev-high)' }}>
              {DIGECAM_STATS.credentialsExposed.toLocaleString()}
            </div>
            <div className="kpi-label">credenciales</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>expuestas públicamente</div>
          </div>
          <div className="kpi text-center" style={{ alignItems: 'center' }}>
            <div className="kpi-value" style={{ fontSize: 36, color: 'var(--sev-critical)' }}>
              {DIGECAM_STATS.daysBetweenSignalAndConfirmation}
            </div>
            <div className="kpi-label">días</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>entre primera señal y confirmación</div>
          </div>
        </section>

        {/* Context */}
        <section
          className="mb-10 panel"
          style={{ borderColor: 'rgba(212,164,90,0.2)', background: 'rgba(212,164,90,0.04)' }}
        >
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
            <strong style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>Contexto:</strong>{' '}
            entre abril y mayo de 2026, Guatemala sufrió una oleada de ciberataques a instituciones del Estado
            (DIGECAM, MINTRAB, MSPAS, MINEDUC, entre otras). La investigación de Vector Crítico documentó un{' '}
            <strong style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>patrón recurrente</strong>:{' '}
            credenciales de empleados aparecían en mercados clandestinos{' '}
            <em>meses antes</em> del ataque público — sin que el Estado tuviese alerta temprana.
          </p>
        </section>

        {/* Timeline */}
        <section>
          <p className="eyebrow mb-6">Qué habría detectado NOMAD Centinela</p>
          <div>
            {DIGECAM_TIMELINE.map((item, i) => (
              <TimelineItem
                key={i}
                item={item}
                index={i}
                isLast={i === DIGECAM_TIMELINE.length - 1}
              />
            ))}
          </div>
        </section>

        {/* Key takeaway */}
        <section
          className="mt-4 panel"
          style={{ borderColor: 'rgba(127,177,196,0.2)', background: 'rgba(127,177,196,0.04)' }}
        >
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
            <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>
              Si NOMAD Centinela hubiera estado operando en septiembre 2025:
            </strong>{' '}
            la primera señal OSINT habría triggered una alerta a los equipos defensores ~7 meses antes
            del comunicado oficial de abril 2026 — dando tiempo suficiente para rotar credenciales,
            activar 2FA y limitar el daño.
          </p>
        </section>

        {/* Disclaimer + links */}
        <footer
          className="mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>
            Datos de demostración sintéticos basados en reportes públicos de Vector Crítico (
            <a
              href={DIGECAM_STATS.vectorCriticoReference}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline', transition: 'color 0.2s' }}
            >
              enlace público
            </a>
            ). NOMAD Centinela no rehospeda credenciales ni PII; las cifras aquí citadas son
            agregadas y de dominio público.
          </p>
          <div className="mt-5 flex gap-5 flex-wrap">
            <Link
              href="/playground"
              style={{ fontSize: 13, color: 'var(--sev-medium)', textDecoration: 'none', transition: 'opacity 0.2s' }}
            >
              ← Probar la API en el playground
            </Link>
            <Link
              href="/demo"
              style={{ fontSize: 13, color: 'rgba(180,130,220,0.85)', textDecoration: 'none', transition: 'opacity 0.2s' }}
            >
              ← Ver el demo en vivo
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
