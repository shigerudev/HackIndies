import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchEvent } from '@/lib/api';
import { Toolbar } from '@/components/ui/Toolbar';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Tag } from '@/components/ui/Tag';
import { KeyValue } from '@/components/ui/KeyValue';
import { AgentTrace } from '@/components/product/AgentTrace';
import { NarrativeDraftProduct } from '@/components/product/NarrativeDraftProduct';

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
    <>
      <Toolbar
        eyebrow="NOMAD security"
        title={event.title}
        meta={`${event.institution_name} · ${new Date(event.first_seen_at).toLocaleString('es-GT')}`}
        actions={<SeverityChip severity={event.severity} />}
      />

      <div className="page-content">
        <Link href="/app/eventos" className="btn-link" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Volver a eventos
        </Link>

        <div className="card mb-4">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <SeverityChip severity={event.severity} />
            <Tag variant={event.status === 'published' ? 'green' : event.status === 'pending_review' ? 'amber' : 'default'}>
              {event.status}
            </Tag>
            {event.actor_name && (
              <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Actor: {event.actor_name}</span>
            )}
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <KeyValue label="Institución" value={event.institution_name} />
            <KeyValue label="Credenciales" value={event.credentials_count > 0 ? event.credentials_count.toLocaleString() : '—'} />
            <KeyValue label="Resumen" value={event.summary ?? '—'} />
          </div>
        </div>

        <AgentTrace eventId={event.id} />
        <NarrativeDraftProduct eventId={event.id} status={event.status} />

        {event.traces.length > 0 && (
          <div className="tracelog">
            <div className="tracelog__head">
              <span>Agente</span>
              <span>Latencia</span>
            </div>
            {event.traces.map((t) => (
              <div key={t.id} className="tracelog__row">
                <div className="tracelog__agent">{t.agent_name}</div>
                <div className="tracelog__latency">{t.latency_ms !== null ? `${t.latency_ms}ms` : '—'}</div>
                <div className="tracelog__output">
                  <pre>{JSON.stringify(t.output, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {event.hitl_reviews.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12 }}>
              Revisiones HITL
            </div>
            {event.hitl_reviews.map((r) => (
              <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag variant={r.decision === 'approved' ? 'green' : 'red'}>{r.decision}</Tag>
                  <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>por {r.reviewer}</span>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6 }}>{r.comment}</p>}
                <p style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>{new Date(r.decided_at).toLocaleString('es-GT')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}