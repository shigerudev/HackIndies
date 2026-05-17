import Link from 'next/link';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Tag } from '@/components/ui/Tag';
import type { ExposureEvent } from '@/lib/api';
import { clsx } from 'clsx';

type Props = {
  event: ExposureEvent;
  className?: string;
};

function statusVariant(status: string): 'default' | 'green' | 'amber' | 'red' | 'blue' {
  if (status === 'published') return 'green';
  if (status === 'pending_review') return 'amber';
  if (status === 'dismissed') return 'red';
  return 'default';
}

export function EventRow({ event, className }: Props) {
  return (
    <Link href={`/app/eventos/${event.id}`} className={clsx('event-row', className)}>
      <div className="event-row__sev-col">
        <SeverityChip severity={event.severity} />
      </div>
      <div className="event-row__body">
        <div className="event-row__title">{event.title}</div>
        <div className="event-row__meta">
          <span>{event.institution_name}</span>
          <span>{event.actor_name && `Actor: ${event.actor_name}`}</span>
          <span>{new Date(event.first_seen_at).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>
      <div className="event-row__right">
        <Tag variant={statusVariant(event.status)}>{event.status}</Tag>
        {event.credentials_count > 0 && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', color: 'var(--fg-muted)' }}>
            {event.credentials_count.toLocaleString()} cred.
          </span>
        )}
      </div>
    </Link>
  );
}