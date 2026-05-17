'use client';

import { useState } from 'react';
import { generateNarrative } from '@/lib/api';

type NarrativeOutput = {
  title_es: string;
  body_md: string;
  key_facts: { fact: string; source: string }[];
  sources_cited: string[];
  draft_quality: string;
  confidence: number;
};

type NarrativeResult = {
  narrative: NarrativeOutput;
  mock: boolean;
  run_id: string;
};

export function NarrativeDraft({ eventId, status }: { eventId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<NarrativeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'published') return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase text-slate-400">Borrador narrativo</h2>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await generateNarrative(eventId) as NarrativeResult;
              setDraft(res.narrative);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="rounded border border-cyan-800 px-3 py-1.5 text-sm text-cyan-400 transition hover:bg-cyan-900/20 disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar borrador'}
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-300">Error: {error}</p>
      )}

      {draft && (
        <div className="rounded border border-emerald-800/40 bg-emerald-950/20 p-4">
          <p className="text-xs text-slate-500 mb-1">Calidad: {draft.draft_quality} · confianza: {(draft.confidence * 100).toFixed(0)}%</p>
          <h3 className="text-lg font-bold text-emerald-200">{draft.title_es}</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {draft.body_md.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {draft.key_facts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">Hechos clave</p>
              <ul className="space-y-1">
                {draft.key_facts.map((f, i) => (
                  <li key={i} className="text-xs text-slate-400">
                    <span className="text-cyan-400">•</span> {f.fact} <span className="text-slate-600">(src: {f.source})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {draft.sources_cited.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">Fuentes: {draft.sources_cited.join(', ')}</p>
          )}
        </div>
      )}

      {!draft && !loading && (
        <p className="text-sm text-slate-600">Sin borrador aún. Solo disponible para eventos publicados.</p>
      )}
    </section>
  );
}