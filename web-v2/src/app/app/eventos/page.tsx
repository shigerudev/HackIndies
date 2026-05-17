import Link from 'next/link';
import { fetchEvents } from '@/lib/api';
import { Toolbar } from '@/components/ui/Toolbar';
import { EventRow } from '@/components/product/EventRow';
import { SeverityChip } from '@/components/ui/SeverityChip';

const TABS = [
  { label: 'Pendientes', status: 'pending_review' },
  { label: 'Publicados', status: 'published' },
  { label: 'Descartados', status: 'dismissed' },
];

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'pending_review' } = await searchParams;
  let error: string | null = null;
  let events: Awaited<ReturnType<typeof fetchEvents>>['data'] = [];
  let mock = false;

  try {
    const res = await fetchEvents({ status });
    events = res.data;
    mock = res.mock;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  const counts = { pending_review: 0, published: 0, dismissed: 0 };

  return (
    <>
      <Toolbar
        eyebrow="NOMAD security"
        title="Eventos"
        meta={error ?? (mock ? 'Modo mock activo' : undefined)}
        actions={
          mock ? (
            <span className="tag amber">API mock</span>
          ) : undefined
        }
      />

      <div className="tab-bar">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/app/eventos?status=${tab.status}`}
            className={`tab-bar__item ${status === tab.status ? 'active' : ''}`}
          >
            {tab.label}
            {counts[tab.status as keyof typeof counts] > 0 && (
              <span className="tab-bar__count">{counts[tab.status as keyof typeof counts]}</span>
            )}
          </Link>
        ))}
      </div>

      <div className="page-content">
        {error && (
          <div className="card mb-4" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244,63,94,0.08)' }}>
            <p style={{ color: 'var(--accent-rose)', fontSize: 14 }}>
              No se pudo conectar al backend. Corr{' '}
              <code className="code-inline">npm run dev</code> en backend/
            </p>
            <p style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 8 }}>{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Sin eventos con status={status}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}