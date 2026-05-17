'use client';

import { useState } from 'react';
import { generateNarrative } from '@/lib/api';
import { Tag } from '@/components/ui/Tag';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type NarrativeOutput = {
  title_es: string;
  body_md: string;
  key_facts: { fact: string; source: string }[];
  sources_cited: string[];
  draft_quality: string;
  confidence: number;
};

type Props = { eventId: string; status: string };

export function NarrativeDraftProduct({ eventId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<NarrativeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'published') return null;

  return (
    <div className="narrative-card mb-4">
      <div className="narrative-card__head">
        <div className="narrative-card__title">Borrador narrativo</div>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await generateNarrative(eventId) as { narrative: NarrativeOutput };
              setDraft(res.narrative);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Generando…' : 'Generar borrador'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 20px', color: 'var(--accent-rose)', fontSize: 13 }}>Error: {error}</div>
      )}

      {draft && (
        <div className="narrative-card__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Tag variant="green">{draft.draft_quality}</Tag>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              confianza {(draft.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 12 }}>{draft.title_es}</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.body_md}</ReactMarkdown>
          {draft.key_facts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>Hechos clave</div>
              <ul style={{ paddingLeft: 16 }}>
                {draft.key_facts.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--brand-cyan)' }}>•</span> {f.fact}
                    <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}> (src: {f.source})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {draft.sources_cited.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--fg-muted)' }}>
              Fuentes: {draft.sources_cited.join(', ')}
            </div>
          )}
        </div>
      )}

      {!draft && !loading && (
        <div style={{ padding: '20px', fontSize: 13, color: 'var(--fg-muted)' }}>
          Sin borrador aún. Solo disponible para eventos publicados.
        </div>
      )}
    </div>
  );
}