'use client';

import { useState } from 'react';
import { runInvestigate, runTriage } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

type Props = { eventId: string };

export function AgentTrace({ eventId }: Props) {
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
    <div className="card mb-4">
      <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--brand-cyan)', marginBottom: 12 }}>
        Agentes
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          onClick={onTriage}
          disabled={loading !== null}
          className="btn btn-primary"
        >
          {loading === 'triage' ? <Spinner size={14} /> : null}
          {loading === 'triage' ? 'Ejecutando…' : 'Ejecutar Triage'}
        </button>
        <button
          type="button"
          onClick={onInvestigate}
          disabled={loading !== null}
          className="btn btn-secondary"
        >
          {loading === 'investigate' ? <Spinner size={14} /> : null}
          {loading === 'investigate' ? 'Investigando…' : 'Ejecutar Investigator'}
        </button>
      </div>
      {result && (
        <p style={{ marginTop: 14, fontSize: 14, color: 'var(--fg-primary)', lineHeight: 1.55 }}>{result}</p>
      )}
      {error && (
        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--accent-rose)' }}>{error}</p>
      )}
    </div>
  );
}