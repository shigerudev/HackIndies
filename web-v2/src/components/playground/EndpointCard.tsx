'use client';

import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

type Method = 'GET' | 'POST';

type Props = {
  method: Method;
  path: string;
  description: string;
  params?: { name: string; label: string; type: 'text' | 'select'; options?: string[]; default?: string }[];
  action: (params: Record<string, string>) => Promise<unknown>;
  snippets?: { lang: string; label: string; code: string }[];
};

export function EndpointCard({ method, path, description, params = [], action, snippets }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [showSnippets, setShowSnippets] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    params.forEach((p) => { if (p.default) defaults[p.name] = p.default; });
    return defaults;
  });

  async function run() {
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      const res = await action(paramValues);
      setResult(res);
      setLatency(Date.now() - start);
      setStatusCode(200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const methodColors: Record<Method, string> = {
    GET: 'method-get',
    POST: 'method-post',
  };

  return (
    <div className="card mb-4">
      <div className="pg-endpoint-card__head">
        <span className={methodColors[method]}>{method}</span>
        <code className="pg-endpoint-card__path">{path}</code>
      </div>
      <p className="pg-endpoint-card__desc">{description}</p>

      {params.length > 0 && (
        <div className="pg-endpoint-card__params">
          {params.map((p) => (
            <div key={p.name} className="pg-endpoint-card__param">
              <label className="pg-param-label">{p.label}</label>
              {p.type === 'select' ? (
                <select
                  className="pg-select"
                  aria-label={p.label}
                  value={paramValues[p.name] ?? ''}
                  onChange={(e) => setParamValues((v) => ({ ...v, [p.name]: e.target.value }))}
                >
                  {p.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={p.default}
                  className="pg-input"
                  value={paramValues[p.name] ?? ''}
                  onChange={(e) => setParamValues((v) => ({ ...v, [p.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pg-endpoint-card__actions">
        <button
          onClick={run}
          disabled={loading}
          className="btn btn-primary"
        >
          <Play size={14} />
          {loading ? 'Running…' : 'Run'}
        </button>

        {snippets && (
          <button
            type="button"
            onClick={() => setShowSnippets((s) => !s)}
            className="btn-link"
          >
            {showSnippets ? 'hide code' : 'show code'}
          </button>
        )}

        {latency !== null && (
          <span className="pg-endpoint-card__latency">{latency}ms · {statusCode}</span>
        )}
      </div>

      {error && (
        <div className="pg-endpoint-card__error">
          {error}
        </div>
      )}

      {result !== null && result !== undefined && (
        <div className="relative">
          <div className="pg-endpoint-card__copy-json">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="pg-copy-btn"
            >
              <Copy size={11} /> copy json
            </button>
          </div>
          <pre className="pg-json">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {showSnippets && snippets && (
        <div className="mt-4">
          <CodeBlock snippets={snippets} />
        </div>
      )}
    </div>
  );
}