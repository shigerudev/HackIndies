'use client';

import { useState } from 'react';
import { runInvestigate, runTriage } from '@/lib/api';

export function AgentActions({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState<'triage' | 'investigate' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTriage, setLastTriage] = useState<unknown>(null);

  async function onTriage() {
    setLoading('triage');
    setError(null);
    try {
      const json = await runTriage(eventId);
      setLastTriage(json.triage);
      setResult(`Triage: ${json.triage.severity} — ${json.triage.reasoning_brief}${json.mock ? ' (mock)' : ''}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(null);
    }
  }

  async function onInvestigate() {
    setLoading('investigate');
    setError(null);
    try {
      const json = await runInvestigate(eventId, lastTriage ?? undefined);
      setResult(
        `Investigator: ${json.investigation.label} (${Math.round(json.investigation.confidence * 100)}%) — ${json.investigation.recommendation}. HITL requerido.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-400">Agentes (Fase 1)</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTriage}
          disabled={loading !== null}
          className="rounded bg-cyan-800 px-3 py-1.5 text-sm text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading === 'triage' ? 'Triage…' : 'Ejecutar Triage'}
        </button>
        <button
          type="button"
          onClick={onInvestigate}
          disabled={loading !== null}
          className="rounded border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {loading === 'investigate' ? 'Investigando…' : 'Ejecutar Investigator'}
        </button>
      </div>
      {result && <p className="mt-3 text-sm text-slate-300">{result}</p>}
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
