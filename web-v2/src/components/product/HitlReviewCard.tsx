'use client';

import { useState } from 'react';
import { approveEvent, rejectEvent } from '@/lib/api';
import type { ExposureEvent } from '@/lib/api';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Tag } from '@/components/ui/Tag';

type PendingItem = ExposureEvent;

type Props = {
  event: PendingItem;
  onAction: (eventId: string, action: 'approved' | 'rejected') => void;
};

export function HitlReviewCard({ event, onAction }: Props) {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  async function handle(action: 'approved' | 'rejected') {
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
  }

  return (
    <div className="hitl-card mb-3">
      <div className="hitl-card__head">
        <div>
          <div className="hitl-card__title">{event.title}</div>
          <div className="hitl-card__meta">
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{event.institution_name}</span>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              {new Date(event.first_seen_at).toLocaleString('es-GT')}
            </span>
          </div>
        </div>
        <SeverityChip severity={event.severity} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 12 }}>{event.summary}</p>
      <div className="hitl-card__comment">
        <textarea
          placeholder="Comentario opcional..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          aria-label="Comentario de revisión"
        />
      </div>
      <div className="hitl-card__actions">
        <button
          type="button"
          onClick={() => handle('approved')}
          disabled={loading}
          className="action-btn ok"
        >
          {loading ? 'Procesando...' : 'Aprobar'}
        </button>
        <button
          type="button"
          onClick={() => handle('rejected')}
          disabled={loading}
          className="action-btn ko"
        >
          {loading ? 'Procesando...' : 'Rechazar'}
        </button>
      </div>
    </div>
  );
}