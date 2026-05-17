'use client';

import { useState } from 'react';
import { fetchHitlPending } from '@/lib/api';
import type { ExposureEvent } from '@/lib/api';
import { Toolbar } from '@/components/ui/Toolbar';
import { Tag } from '@/components/ui/Tag';
import { Spinner } from '@/components/ui/Spinner';
import { HitlReviewCard } from '@/components/product/HitlReviewCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { ListChecks } from 'lucide-react';

export default function HitlPage() {
  const [pending, setPending] = useState<ExposureEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);

  async function load() {
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
  }

  function handleAction(eventId: string, _action: 'approved' | 'rejected') {
    setPending((prev) => prev.filter((e) => e.id !== eventId));
  }

  return (
    <>
      <Toolbar
        eyebrow="NOMAD security"
        title="Panel HITL"
        meta="Revisá o rechazá eventos antes de que se publiquen."
        actions={
          mock ? (
            <Tag variant="amber">Modo mock</Tag>
          ) : undefined
        }
      />

      <div className="page-content">
        {!loaded && !error && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <button type="button" onClick={load} className="btn btn-primary">
              Cargar eventos pendientes
            </button>
          </div>
        )}

        {error && (
          <div className="card mb-4" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244,63,94,0.08)' }}>
            <p style={{ color: 'var(--accent-rose)', fontSize: 14 }}>Error al cargar: {error}</p>
          </div>
        )}

        {loaded && pending.length === 0 && (
          <EmptyState
            icon={<ListChecks size={48} />}
            title="No hay eventos pendientes"
            hint="Corré el demo para generar eventos con hitl_required: true"
            action={
              <Link href="/app/demo" className="btn btn-secondary">
                Ver demo
              </Link>
            }
          />
        )}

        {loaded && pending.length > 0 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16 }}>
              {pending.length} evento{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''}
            </p>
            {pending.map((e) => (
              <HitlReviewCard key={e.id} event={e} onAction={handleAction} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? <Spinner size={14} /> : null}
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>
      </div>
    </>
  );
}