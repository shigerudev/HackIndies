'use client';

import type { DIGECAM_TIMELINE } from '@/lib/digecam-data';

type TimelineEntry = (typeof DIGECAM_TIMELINE)[number];

const TYPE_STYLES: Record<string, string> = {
  osint: 'timeline-item--osint',
  public_report: 'timeline-item--public',
  remediation: 'timeline-item--remediation',
};

const TYPE_LABELS: Record<string, string> = {
  osint: 'OSINT',
  public_report: 'Reporte público',
  remediation: 'Remediación',
};

export function CaseTimeline({ items }: { items: TimelineEntry[] }) {
  return (
    <div className="timeline-v">
      {items.map((item, i) => (
        <div key={i} className={`timeline-item ${TYPE_STYLES[item.type] ?? ''}`}>
          <div className="timeline-item__dot" />
          {i < items.length - 1 && <div className="timeline-item__line" />}

          <div className="timeline-item__body">
            <div className="timeline-item__head">
              <span className="timeline-item__date">{item.date}</span>
              <span className="tag tag--sm">{TYPE_LABELS[item.type] ?? item.type}</span>
            </div>
            <p className="timeline-item__signal">{item.signal}</p>
            <p className="timeline-item__note">{item.note}</p>
            <div className="timeline-item__nomad">
              <span className="timeline-item__arrow">→</span>
              <span>{item.nomadAction}</span>
              <span className="timeline-item__meta">
                agente: <span>{item.agent}</span>
                <span className="mx-1">·</span>
                fuente: <span>{item.source}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}