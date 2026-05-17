import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DIGECAM_TIMELINE, DIGECAM_STATS } from '@/lib/digecam-data';
import { CaseTimeline } from '@/components/case/CaseTimeline';
import type { Metadata } from 'next';

const CASES: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  timeline: typeof DIGECAM_TIMELINE;
  stats: { label: string; value: string | number; hint: string; color?: string }[];
  context: string;
  takeaway: string;
  reference?: string;
}> = {
  digecam: {
    title: 'Caso DIGECAM',
    subtitle: 'Dirección General de Gestión del Catastro Nacional',
    description:
      'Entre septiembre 2025 y abril 2026, las credenciales del personal de DIGECAM aparecieron en mercados clandestinos 7 meses antes de la confirmación oficial del ataque.',
    timeline: DIGECAM_TIMELINE,
    stats: [
      { label: 'meses de ventaja', value: DIGECAM_STATS.monthsOfAdvantage, hint: 'para defensores', color: '' },
      { label: 'credenciales', value: DIGECAM_STATS.credentialsExposed.toLocaleString(), hint: 'expuestas públicamente', color: 'amber' },
      { label: 'días', value: DIGECAM_STATS.daysBetweenSignalAndConfirmation, hint: 'entre primera señal y confirmación', color: 'rose' },
    ],
    context:
      'Entre abril y mayo de 2026, Guatemala sufrió una oleada de ciberataques a instituciones del Estado (DIGECAM, MINTRAB, MSPAS, MINEDUC, entre otras). La investigación de Vector Crítico documentó un patrón recurrente: credenciales de empleados aparecían en mercados clandestinos meses antes del ataque público — sin que el Estado tuviese alerta temprana.',
    takeaway:
      'Si NOMAD Centinela hubiera estado operando en septiembre 2025: la primera señal OSINT habría triggered una alerta a los equipos defensores ~7 meses antes del comunicado oficial de abril 2026 — dando tiempo suficiente para rotar credenciales, activar 2FA y limitar el daño.',
    reference: DIGECAM_STATS.vectorCriticoReference,
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) return {};
  return { title: `${c.title} — NOMAD Centinela` };
}

export default async function CasoSlugPage({ params }: Props) {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) notFound();

  return (
    <div className="page-content">
      <header className="case-header">
        <Link href="/casos" className="back-link">← Casos</Link>
        <p className="eyebrow">Caso público</p>
        <h1>{c.title}</h1>
        <p className="case-header__sub">{c.subtitle}</p>
      </header>

      {/* Hero stats */}
      <section className="stat-grid mb-10">
        {c.stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card__num ${s.color ? s.color : ''}`}>{s.value}</div>
            <div className="stat-card__lbl">{s.label}</div>
            <div className="stat-card__hint">{s.hint}</div>
          </div>
        ))}
      </section>

      {/* Context */}
      <section className="card mb-10 context-card">
        <p>{c.context}</p>
      </section>

      {/* Timeline */}
      <section className="mb-10">
        <h2 className="section-label">Qué habría detectado NOMAD Centinela</h2>
        <CaseTimeline items={c.timeline} />
      </section>

      {/* Takeaway */}
      <section className="card takeaway-card mb-10">
        <p><strong>Si NOMAD Centinela hubiera estado operando en septiembre 2025:</strong> {c.takeaway}</p>
      </section>

      {/* Disclaimer */}
      <footer className="case-footer">
        <p>
          Datos de demostración sintéticos basados en reportes públicos de Vector Crítico (
          {c.reference && (
            <a href={c.reference} target="_blank" rel="noopener noreferrer">
              enlace público
            </a>
          )}
          ). NOMAD Centinela no rehospeda credenciales ni PII; las cifras aquí citadas son agregadas y de dominio público.
        </p>
        <div className="case-footer__links">
          <Link href="/app/playground">← Probar la API en el playground</Link>
          <Link href="/app/demo">← Ver el demo en vivo</Link>
        </div>
      </footer>
    </div>
  );
}