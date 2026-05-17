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
  'respuesta ante泄露 de contrasenas',
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_QUERIES.map((pq) => (
          <button
            key={pq}
            onClick={() => {
              setQuery(pq);
              runSearch(pq, mode);
            }}
            className={`text-xs px-3 py-1.5 rounded border transition ${
              query === pq
                ? 'border-cyan-600 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {PRESET_LABELS[pq] ?? pq}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query, mode)}
          placeholder="Buscar playbook..."
          className="flex-1 rounded border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 outline-none focus:border-cyan-600"
        />
        <div className="flex rounded border border-slate-700 overflow-hidden">
          {(['fts', 'vector', 'auto'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                runSearch(query, m);
              }}
              className={`px-4 py-2 text-sm font-medium transition ${
                mode === m
                  ? 'bg-cyan-800 text-cyan-100'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => runSearch(query, mode)}
          disabled={loading}
          className="rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">
              {result.data.length} resultado{result.data.length !== 1 ? 's' : ''} en modo{' '}
              <span className="text-cyan-400 font-mono">{result.mode}</span>
              {result.mock && (
                <span className="ml-2 rounded bg-amber-900/40 px-1.5 py-0.5 text-xs text-amber-200">
                  mock
                </span>
              )}
            </span>
            <span className="text-xs text-slate-600 font-mono">q=&quot;{result.query}&quot;</span>
          </div>
          {result.data.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Sin resultados en modo {result.mode}.
              {result.mode === 'vector' && ' Probá Auto para caer a FTS.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {result.data.map((pb) => (
                <li
                  key={pb.slug}
                  className="rounded border border-slate-800 p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-cyan-400 text-xs">{pb.slug}</span>
                      <p className="mt-1 font-medium text-slate-200">{pb.title_es}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0">
                      <div>{pb.effort_hours}h</div>
                      <div>${pb.cost_estimate_usd?.toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {pb.body_md.substring(0, 120)}...
                  </p>
                  {pb.tags?.length > 0 && (
                    <div className="mt-1.5 flex gap-1 flex-wrap">
                      {pb.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200">
        <strong>Vector mode</strong> usa embeddings MiniMax (embo-01) + pgvector cosine distance.
        Requires: migracion 0003 aplicada + <code>npm run embed:playbooks</code> corrido.
        Sin embeddings, Vector cae automaticamente a FTS.
      </div>
    </div>
  );
}