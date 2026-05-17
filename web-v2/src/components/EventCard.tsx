import Link from 'next/link';
import type { ExposureEvent } from '@/lib/api';
import { SeverityBadge } from './SeverityBadge';

export function EventCard({ event }: { event: ExposureEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border border-slate-700 bg-slate-900/60 p-4 transition hover:border-cyan-700/60"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{event.title}</h3>
        <SeverityBadge severity={event.severity} />
      </div>
      <p className="mt-2 text-sm text-slate-400">{event.institution_name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{event.summary}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="rounded bg-slate-800 px-2 py-0.5">{event.status}</span>
        {event.credentials_count > 0 && (
          <span>{event.credentials_count.toLocaleString()} cred. (metadato)</span>
        )}
        <span>{new Date(event.first_seen_at).toLocaleDateString('es-GT')}</span>
      </div>
    </Link>
  );
}
