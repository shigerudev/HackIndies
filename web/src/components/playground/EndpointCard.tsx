'use client';

import { useState } from 'react';
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
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className={`font-mono text-xs font-bold ${methodColors[method]}`}>{method}</span>
        <code className="text-sm text-cyan-300 font-mono">{path}</code>
      </div>
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {params.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {params.map((p) => (
            <div key={p.name} className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-mono">{p.label}</label>
              {p.type === 'select' ? (
                <select
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200"
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
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 w-40"
                  value={paramValues[p.name] ?? ''}
                  onChange={(e) => setParamValues((v) => ({ ...v, [p.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={run}
          disabled={loading}
          className="rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 px-4 py-1.5 text-sm font-semibold text-white transition-colors"
        >
          {loading ? 'Running…' : '▶ Run'}
        </button>

        {snippets && (
          <button
            onClick={() => setShowSnippets((s) => !s)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {showSnippets ? 'hide code' : 'show code'}
          </button>
        )}

        {latency !== null && (
          <span className="text-xs text-slate-500 font-mono">{latency}ms · {statusCode}</span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-950/30 border border-red-800 rounded p-3 font-mono">
          {error}
        </div>
      )}

      {result !== null && result !== undefined && (
        <div className="relative">
          <div className="absolute right-2 top-2">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
            >
              copy json
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 bg-slate-950 rounded p-3 overflow-auto max-h-72 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {showSnippets && snippets && <div className="mt-4"><CodeBlock snippets={snippets} /></div>}
    </div>
  );
}