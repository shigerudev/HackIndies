import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchEvent } from '@/lib/api';
import { SeverityBadge } from '@/components/SeverityBadge';
import { AgentActions } from '@/components/AgentActions';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await fetchEvent(id);
  } catch {
    notFound();
  }

  const event = data.data;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/" className="text-sm text-cyan-400 hover:underline">
        ← Volver al dashboard
      </Link>

      <header className="mt-6 border-b border-slate-700 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <SeverityBadge severity={event.severity} />
        </div>
        <p className="mt-2 text-slate-400">{event.institution_name}</p>
        <p className="mt-3 text-slate-300">{event.summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>Estado: {event.status}</span>
          {event.actor_name && <span>Actor: {event.actor_name}</span>}
          <span>{new Date(event.first_seen_at).toLocaleString('es-GT')}</span>
        </div>
      </header>

      <div className="mt-8 grid gap-6">
        <AgentActions eventId={event.id} />

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">Trazas de agentes</h2>
          <ul className="space-y-2">
            {event.traces.map((t) => (
              <li key={t.id} className="rounded border border-slate-700 bg-slate-900/40 p-3 text-sm">
                <span className="font-mono text-cyan-400">{t.agent_name}</span>
                <span className="text-slate-500"> · {t.latency_ms}ms</span>
                <pre className="mt-2 overflow-x-auto text-xs text-slate-500">
                  {JSON.stringify(t.output, null, 2)}
                </pre>
              </li>
            ))}
            {event.traces.length === 0 && (
              <p className="text-sm text-slate-500">Sin trazas aún. Ejecutá Triage o Investigator.</p>
            )}
          </ul>
        </section>

        {event.hitl_reviews.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">Revisiones HITL</h2>
            <ul className="space-y-2">
              {event.hitl_reviews.map((r) => (
                <li key={r.id} className="rounded border border-slate-700 p-3 text-sm">
                  <strong>{r.decision}</strong> por {r.reviewer}
                  {r.comment && <p className="mt-1 text-slate-400">{r.comment}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
