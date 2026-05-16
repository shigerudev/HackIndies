import Link from 'next/link';
import { fetchEvents } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { CitizenChat } from '@/components/CitizenChat';

function ComparisonTable() {
  const competitors = [
    { name: 'HIBP', open: false, latam: false, multi: false, hitl: false },
    { name: 'Spycloud / Constella', open: false, latam: false, multi: false, hitl: false },
    { name: 'Vector Crítico', open: true, latam: true, multi: false, hitl: false },
    { name: 'CIRTs nacionales', open: false, latam: true, multi: false, hitl: false },
    { name: 'NOMAD Centinela', open: true, latam: true, multi: true, hitl: true },
  ];

  return (
    <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <p className="mb-2 text-xs uppercase tracking-widest text-cyan-400">Cómo nos diferenciamos</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 pr-4 text-slate-400">Herramienta</th>
              <th className="text-center py-2 px-2 text-slate-400">Open source</th>
              <th className="text-center py-2 px-2 text-slate-400">LATAM-first</th>
              <th className="text-center py-2 px-2 text-slate-400">Multi-stakeholder</th>
              <th className="text-center py-2 px-2 text-slate-400">HITL ético</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((row) => (
              <tr key={row.name} className={row.name === 'NOMAD Centinela' ? 'bg-cyan-950/20' : 'border-b border-slate-800/50'}>
                <td className={`py-2 pr-4 font-medium ${row.name === 'NOMAD Centinela' ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {row.name}
                </td>
                {(['open', 'latam', 'multi', 'hitl'] as const).map((col) => (
                  <td key={col} className="text-center py-2 px-2">
                    {row[col] ? (
                      <span className={row.name === 'NOMAD Centinela' ? 'text-cyan-400' : 'text-emerald-400'}>✓</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        HIBP = Have I Been Pwned · Spycloud = commerciale USA · CIRTs = gubernamentales
      </p>
    </div>
  );
}

export default async function HomePage() {
  let error: string | null = null;
  let mock = false;
  let published: Awaited<ReturnType<typeof fetchEvents>>['data'] = [];
  let pending: Awaited<ReturnType<typeof fetchEvents>>['data'] = [];

  try {
    const [pub, pend] = await Promise.all([
      fetchEvents({ status: 'published' }),
      fetchEvents({ status: 'pending_review' }),
    ]);
    published = pub.data;
    pending = pend.data;
    mock = pub.mock || pend.mock;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-10 border-b border-slate-700 pb-6">
        <p className="text-sm uppercase tracking-widest text-cyan-400">NOMAD security</p>
        <h1 className="mt-2 text-3xl font-bold">NOMAD Centinela</h1>
        <p className="mt-2 text-slate-400">Dashboard defensor — Fase 1</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/" className="text-cyan-400">
            Eventos
          </Link>
          <Link href="/hitl" className="text-amber-400 hover:underline">
           HITL
          </Link>
          <Link href="/demo" className="text-cyan-400 hover:underline">
            Demo
          </Link>
          <Link href="/playground" className="text-cyan-400 hover:underline">
            Playground
          </Link>
          {mock && (
            <span className="rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-200">API mock</span>
          )}
        </div>
      </header>

      <ComparisonTable />

      {error && (
        <div className="mb-6 rounded border border-red-800 bg-red-950/50 p-4 text-red-200">
          No se pudo conectar al backend. ¿Corre <code className="text-cyan-300">npm run dev</code> en backend/?
          <br />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-amber-200">
            Cola HITL / revisión ({pending.length})
          </h2>
          <ul className="mb-10 grid gap-3">
            {pending.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-slate-500">Sin eventos pendientes.</p>
            )}
          </ul>

          <h2 className="mb-4 text-lg font-semibold text-emerald-300">
            Publicados ({published.length})
          </h2>
          <ul className="grid gap-3">
            {published.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        </section>

        <aside>
          <CitizenChat />
        </aside>
      </div>
    </main>
  );
}
