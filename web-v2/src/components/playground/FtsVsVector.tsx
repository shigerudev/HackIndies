'use client';

import { useState } from 'react';
import { searchPlaybooks } from '@/lib/api';

type PlaybookResult = {
  slug: string;
  title_es: string;
  body_md: string;
  effort_hours: number;
  cost_estimate_usd: number;
  tags: string[];
};

type SearchResult = {
  data: PlaybookResult[];
  mock: boolean;
  query: string;
  mode: string;
};

const PRESET_QUERIES = [
  'rotacion masiva de credenciales',
  'respuesta ante fuga de contrasenas',
  'infostealer detectado en red',
  '2FA y remediacion',
];

const PRESET_LABELS: Record<string, string> = {
  'rotacion masiva de credenciales': 'Rotacion credenciales',
  'respuesta ante fuga de contrasenas': 'Respuesta fuga',
  'infostealer detectado en red': 'Infostealer',
  '2FA y remediacion': '2FA remediacion',
};

export function FtsVsVector() {
  const [query, setQuery] = useState('rotacion masiva de credenciales');
  const [mode, setMode] = useState<'fts' | 'vector' | 'auto'>('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (q: string, m: 'fts' | 'vector' | 'auto') => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchPlaybooks(q, m);
      setResult(res as SearchResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fts-vector">
      <div className="fts-vector__presets">
        {PRESET_QUERIES.map((pq) => (
          <button
            key={pq}
            type="button"
            onClick={() => {
              setQuery(pq);
              runSearch(pq, mode);
            }}
            className={`pg-query-chip ${query === pq ? 'pg-query-chip--active' : 'pg-query-chip--inactive'}`}
          >
            {PRESET_LABELS[pq] ?? pq}
          </button>
        ))}
      </div>

      <div className="fts-vector__search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query, mode)}
          placeholder="Buscar playbook..."
          className="pg-input"
        />
        <div className="pg-mode-tabs">
          {(['fts', 'vector', 'auto'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                runSearch(query, m);
              }}
              className={`pg-mode-tab ${mode === m ? 'pg-mode-tab--active' : 'pg-mode-tab--inactive'}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => runSearch(query, mode)}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="fts-vector__error">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="fts-vector__results">
          <div className="fts-vector__results-head">
            <span>
              {result.data.length} resultado{result.data.length !== 1 ? 's' : ''} en modo{' '}
              <span className="fts-vector__mode">{result.mode}</span>
              {result.mock && (
                <span className="tag tag--amber" style={{ marginLeft: 8 }}>mock</span>
              )}
            </span>
            <span className="fts-vector__query">q=&quot;{result.query}&quot;</span>
          </div>
          {result.data.length === 0 ? (
            <div className="pg-fts-empty">
              Sin resultados en modo {result.mode}.
              {result.mode === 'vector' && ' Probá Auto para caer a FTS.'}
            </div>
          ) : (
            <ul className="fts-vector__list">
              {result.data.map((pb) => (
                <li key={pb.slug} className="pg-fts-result">
                  <div className="pg-fts-result__head">
                    <div>
                      <span className="pg-fts-result__slug">{pb.slug}</span>
                      <p className="pg-fts-result__title">{pb.title_es}</p>
                    </div>
                    <div className="pg-fts-result__meta">
                      <div>{pb.effort_hours}h</div>
                      <div>${pb.cost_estimate_usd?.toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="pg-fts-result__excerpt">
                    {pb.body_md.substring(0, 120)}...
                  </p>
                  {pb.tags?.length > 0 && (
                    <div className="fts-vector__tags">
                      {pb.tags.slice(0, 4).map((t) => (
                        <span key={t} className="pg-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="fts-vector__hint">
        <strong>Vector mode</strong> usa embeddings MiniMax (embo-01) + pgvector cosine distance.
        Requires: migracion 0003 aplicada + <code className="code-inline">npm run embed:playbooks</code> corrido.
        Sin embeddings, Vector cae automaticamente a FTS.
      </div>
    </div>
  );
}