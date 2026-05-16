'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fetchHitlPending, approveEvent, rejectEvent } from '@/lib/api';
import type { ExposureEvent } from '@/lib/api';
import { SeverityBadge } from '@/components/SeverityBadge';

type PendingItem = ExposureEvent;

function EventReviewCard({
  event,
  onAction,
}: {
  event: PendingItem;
  onAction: (eventId: string, action: 'approved' | 'rejected') => void;
}) {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  const handle = async (action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const reviewer = 'defensor-' + Math.random().toString(36).slice(2, 6);
      if (action === 'approved') {
        await approveEvent(event.id, reviewer, comment || undefined);
      } else {
        await rejectEvent(event.id, reviewer, comment || undefined);
      }
      onAction(event.id, action);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link href={`/events/${event.id}`} className="hover:underline">
          <h3 className="font-medium">{event.title}</h3>
        </Link>
        <SeverityBadge severity={event.severity} />
      </div>
      <p className="mt-2 text-sm text-slate-400">{event.institution_name}</p>
      <p className="mt-1 text-sm text-slate-500">{event.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded bg-slate-800 px-2 py-0.5">{event.status}</span>
        {event.actor_name && <span>Actor: {event.actor_name}</span>}
        <span>{new Date(event.first_seen_at).toLocaleString('es-GT')}</span>
      </div>
      <div className="mt-4">
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-200 placeholder-slate-500"
          placeholder="Comentario opcional..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handle('approved')}
            disabled={loading}
            className="rounded bg-emerald-800/60 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-700/60 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Aprobar'}
          </button>
          <button
            onClick={() => handle('rejected')}
            disabled={loading}
            className="rounded bg-red-800/60 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-700/60 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HitlPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHitlPending();
      setPending(res.data);
      setMock(res.mock);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleAction = (eventId: string, action: 'approved' | 'rejected') => {
    setPending((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-8 border-b border-slate-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-cyan-400">NOMAD security</p>
            <h1 className="mt-2 text-2xl font-bold">Panel HITL — Revisión humana</h1>
            <p className="mt-1 text-slate-400">
              Aprobá o rechazá eventos antes de que se publiquen.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {mock && (
              <span className="rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-200">
                Modo mock
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="rounded bg-cyan-800/50 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-700/50 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-500">
          Ver eventos pendientes de revisión — luego de aprobar/rechazar, aparecen en el dashboard.
        </div>
      </header>

      {!loaded && !error && (
        <div className="py-12 text-center">
          <button
            onClick={load}
            className="rounded border border-cyan-800 px-6 py-3 text-cyan-400 transition hover:bg-cyan-900/20"
          >
            Cargar eventos pendientes
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded border border-red-800 bg-red-950/50 p-4 text-red-200">
          Error al cargar: {error}
        </div>
      )}

      {loaded && pending.length === 0 && (
        <div className="rounded border border-slate-700 bg-slate-900/40 p-8 text-center">
          <p className="text-slate-400">No hay eventos pendientes de revisión.</p>
          <p className="mt-2 text-sm text-slate-500">
            Corré el demo en{' '}
            <Link href="/demo" className="text-cyan-400 hover:underline">
              /demo
            </Link>{' '}
            para generar eventos con <code className="text-cyan-300">hitl_required: true</code>.
          </p>
        </div>
      )}

      {loaded && pending.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {pending.length} evento{pending.length !== 1 ? 's' : ''} pendiente
            {pending.length !== 1 ? 's' : ''}
          </p>
          {pending.map((e) => (
            <EventReviewCard key={e.id} event={e} onAction={handleAction} />
          ))}
        </div>
      )}
    </main>
  );
}