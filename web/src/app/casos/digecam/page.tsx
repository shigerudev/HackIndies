import { DIGECAM_TIMELINE, DIGECAM_STATS } from '@/lib/digecam-data';
import Link from 'next/link';

function TimelineItem({
  item,
  index,
}: {
  item: (typeof DIGECAM_TIMELINE)[0];
  index: number;
}) {
  const typeColors: Record<string, string> = {
    osint: 'border-cyan-500 bg-cyan-950/30',
    public_report: 'border-amber-500 bg-amber-950/30',
    remediation: 'border-emerald-500 bg-emerald-950/30',
  };

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full mt-1 border-2 ${typeColors[item.type] ?? 'border-slate-600 bg-slate-800'}`} />
        {index < DIGECAM_TIMELINE.length - 1 && (
          <div className="w-0.5 flex-1 bg-slate-800 my-1" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 mb-6 rounded border p-4 ${typeColors[item.type] ?? 'border-slate-700'}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">{item.date}</span>
          <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">{item.type}</span>
        </div>
        <p className="text-sm text-white font-medium mt-1">{item.signal}</p>
        <p className="text-xs text-slate-400 mt-1">{item.note}</p>
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-xs text-cyan-400">
            <span className="font-mono text-cyan-600">→ </span>
            {item.nomadAction}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-mono text-slate-600">agente: </span>
            <span className="text-slate-400">{item.agent}</span>
            <span className="mx-2">·</span>
            <span className="font-mono text-slate-600">fuente: </span>
            <span className="text-slate-400">{item.source}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CasosDigecamPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            <Link href="/playground" className="hover:text-cyan-300 transition-colors">← Playground</Link>
          </p>
          <h1 className="text-3xl font-black text-white mb-2">Caso DIGECAM</h1>
          <p className="text-slate-400">
            Línea de tiempo basada en reportes públicos de Vector Crítico (abril–mayo 2026).
            Datos agregados; sin credenciales ni PII.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Hero stats */}
        <section className="grid grid-cols-3 gap-4 mb-10">
          <div className="col-span-3 md:col-span-1 bg-slate-900 border border-slate-700 rounded p-4 text-center">
            <div className="text-5xl font-black text-cyan-400 mb-1">{DIGECAM_STATS.monthsOfAdvantage}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest">meses de ventaja</div>
            <div className="text-xs text-slate-500 mt-1">para defensores</div>
          </div>
          <div className="col-span-3 md:col-span-1 bg-slate-900 border border-slate-700 rounded p-4 text-center">
            <div className="text-5xl font-black text-amber-400 mb-1">{DIGECAM_STATS.credentialsExposed.toLocaleString()}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest">credenciales</div>
            <div className="text-xs text-slate-500 mt-1">expuestas públicamente</div>
          </div>
          <div className="col-span-3 md:col-span-1 bg-slate-900 border border-slate-700 rounded p-4 text-center">
            <div className="text-5xl font-black text-red-400 mb-1">{DIGECAM_STATS.daysBetweenSignalAndConfirmation}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest">días</div>
            <div className="text-xs text-slate-500 mt-1">entre primera señal y confirmación</div>
          </div>
        </section>

        {/* Context */}
        <section className="mb-10 p-4 rounded border border-amber-800 bg-amber-950/30">
          <p className="text-sm text-amber-200 leading-relaxed">
            <strong className="text-amber-100">Contexto:</strong> entre abril y mayo de 2026, Guatemala sufrió una oleada de ciberataques a instituciones del Estado (DIGECAM, MINTRAB, MSPAS, MINEDUC, entre otras). La investigación de Vector Crítico documentó un{' '}
            <strong className="text-amber-100">patrón recurrente</strong>: credenciales de empleados aparecían en mercados clandestinos{' '}
            <em>meses antes</em> del ataque público — sin que el Estado tuviese alerta temprana.
          </p>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
            Qué habría detectado NOMAD Centinela
          </h2>
          <div>
            {DIGECAM_TIMELINE.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Key takeaway */}
        <section className="mt-8 p-6 rounded border border-cyan-800 bg-cyan-950/30">
          <p className="text-lg text-cyan-100 leading-relaxed">
            <strong className="text-cyan-200">
              Si NOMAD Centinela hubiera estado operando en septiembre 2025:
            </strong>{' '}
            la primera señal OSINT habría triggered una alerta a los equipos defensores ~7 meses antes
            del comunicado oficial de abril 2026 — dando tiempo suficiente para rotar credenciales,
            activar 2FA y limitar el daño.
          </p>
        </section>

        {/* Disclaimer */}
        <footer className="mt-10 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-600 leading-relaxed">
            Datos de demostración sintéticos basados en reportes públicos de Vector Crítico (
            <a
              href={DIGECAM_STATS.vectorCriticoReference}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors underline"
            >
              enlace público
            </a>
            ). NOMAD Centinela no rehospeda credenciales ni PII; las cifras aquí citadas son
            agregadas y de dominio público. El nombre &ldquo;GordonFreeman&rdquo; es una etiqueta
            usada en reportes OSINT públicos, no datos personales.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/playground"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Probar la API en el playground
            </Link>
            <Link
              href="/demo"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Ver el demo en vivo
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}