'use client';

import { useState, useCallback } from 'react';
import { runPreset, resetEvent, fetchPresets, type PipelineResult, type DemoPreset } from '@/lib/demo-api';
import { SeverityBadge } from '@/components/SeverityBadge';

type StepStatus = 'idle' | 'running' | 'done' | 'error';

interface PipelineSteps {
  ingest: StepStatus;
  triage: StepStatus;
  investigate: StepStatus;
  hitl: StepStatus;
}

function statusColor(s: StepStatus) {
  if (s === 'done') return 'text-emerald-400';
  if (s === 'running') return 'text-cyan-400 animate-pulse';
  if (s === 'error') return 'text-red-400';
  return 'text-slate-500';
}

function statusLabel(s: StepStatus) {
  if (s === 'idle') return 'esperando';
  if (s === 'running') return 'corriendo…';
  if (s === 'done') return 'listo';
  return 'error';
}

function StepDot({ status }: { status: StepStatus }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status === 'done' ? 'bg-emerald-400' : status === 'running' ? 'bg-cyan-400 animate-ping' : status === 'error' ? 'bg-red-400' : 'bg-slate-600'}`} />
  );
}

function PipelineStep({
  label,
  status,
  latencyMs,
  detail,
}: {
  label: string;
  status: StepStatus;
  latencyMs?: number;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-4 rounded border border-slate-800 bg-slate-900/50">
      <div className="flex items-center">
        <StepDot status={status} />
        <span className={`font-mono text-sm ${statusColor(status)}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {detail && <span className="text-xs text-slate-500 font-mono">{detail}</span>}
        {latencyMs !== undefined && status === 'done' && (
          <span className="text-xs text-slate-400 font-mono">{latencyMs}ms</span>
        )}
        <span className={`text-xs font-mono ${statusColor(status)}`}>{statusLabel(status)}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-4 text-center">
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function DemoPage() {
  const [presets, setPresets] = useState<Record<string, DemoPreset> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineSteps>({ ingest: 'idle', triage: 'idle', investigate: 'idle', hitl: 'idle' });
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalMs, setTotalMs] = useState<number | null>(null);

  const loadPresets = useCallback(async () => {
    try {
      const data = await fetchPresets();
      setPresets(data.data);
    } catch {
      setPresets({});
    }
  }, []);

  const runDemo = useCallback(async (presetId: string) => {
    setError(null);
    setResult(null);
    setTotalMs(null);
    setSelectedId(presetId);
    setSteps({ ingest: 'running', triage: 'idle', investigate: 'idle', hitl: 'idle' });

    const t0 = Date.now();
    try {
      const res = await runPreset(presetId);
      setSteps({
        ingest: res.ingest?.duplicate ? 'done' : 'done',
        triage: 'done',
        investigate: 'done',
        hitl: 'done',
      });
      setTotalMs(Date.now() - t0);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSteps(s => ({ ...s, ingest: s.ingest === 'running' ? 'error' : s.ingest, triage: s.triage === 'running' ? 'error' : s.triage, investigate: s.investigate === 'running' ? 'error' : s.investigate }));
    }
  }, []);

  const reset = useCallback(async () => {
    if (!result?.event_id) return;
    setSteps({ ingest: 'idle', triage: 'idle', investigate: 'idle', hitl: 'idle' });
    setResult(null);
    setError(null);
    setTotalMs(null);
    setSelectedId(null);
    await resetEvent(result.event_id);
  }, [result]);

  if (presets === null) {
    loadPresets();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* Hero */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Live Demo · 60 segundos</p>
          <h1 className="text-4xl font-black text-white mb-3">Pipeline completo en vivo</h1>
          <p className="text-slate-400 max-w-xl">
            Seleccioná un escenario → NOMAD ejecuta ingest + Triage + Investigator + HITL review.
            Sin slides. Sin grabación. Datos reales de la API.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">

        {/* Left: Scenarios */}
        <section>
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">1. Seleccioná escenario</h2>
          <div className="space-y-3">
            {presets && Object.values(presets).map((p) => (
              <button
                key={p.id}
                onClick={() => runDemo(p.id)}
                className={`w-full text-left p-4 rounded border transition-all ${
                  selectedId === p.id
                    ? 'border-cyan-500 bg-cyan-950/30'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-white">{p.label}</span>
                  <SeverityBadge severity={p.severity} />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.story_note}</p>
                {p.actor_name && (
                  <p className="text-xs text-slate-600 mt-1 font-mono">actor: {p.actor_name}</p>
                )}
              </button>
            ))}
            {presets && Object.keys(presets).length === 0 && (
              <p className="text-sm text-slate-500">No se pudieron cargar los presets. ¿ API arriba?</p>
            )}
          </div>

          {result && (
            <button
              onClick={reset}
              className="mt-4 w-full py-2 px-4 rounded border border-slate-600 text-sm text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
            >
              ↺ Resetear y repetir
            </button>
          )}
        </section>

        {/* Middle: Pipeline + Result */}
        <section className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">2. Pipeline agentes</h2>
            <div className="space-y-2">
              <PipelineStep
                label="ingest (webhook)"
                status={steps.ingest}
                detail={result?.ingest?.event_id ? `event: ${result.ingest.event_id.slice(0, 8)}…` : undefined}
              />
              <PipelineStep
                label="triage agent"
                status={steps.triage}
                detail={result?.triage?.institution_slug}
              />
              <PipelineStep
                label="investigator agent"
                status={steps.investigate}
                detail={result?.investigation?.label}
              />
              <PipelineStep
                label="hitl review"
                status={steps.hitl}
                detail={result?.hitl_status}
              />
            </div>
          </div>

          {error && (
            <div className="rounded border border-red-800 bg-red-950/50 p-4">
              <p className="text-red-300 font-mono text-sm">Error: {error}</p>
              <p className="text-red-400 text-xs mt-1">Asegurate de que DEMO_MODE=true en el backend y la API esté arriba.</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="credenciales" value={result.triage.credentials_count_estimate.toLocaleString()} sub="estimadas" />
                <MetricCard label="severidad" value={result.triage.severity.toUpperCase()} />
                <MetricCard label="latencia total" value={totalMs ? `${totalMs}ms` : '—'} sub="wall clock" />
              </div>

              {/* Triage result */}
              <div className="rounded border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-cyan-400">TRIAGE</span>
                  <span className="text-xs text-slate-500">confidence: {Math.round(result.triage.confidence * 100)}%</span>
                  {result.mock && <span className="text-xs bg-amber-900/40 text-amber-200 px-2 py-0.5 rounded">mock</span>}
                </div>
                <p className="text-sm text-white font-medium">{result.triage.suggested_title}</p>
                <p className="text-xs text-slate-400 mt-1">{result.triage.reasoning_brief}</p>
              </div>

              {/* Investigation result */}
              <div className="rounded border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-purple-400">INVESTIGATOR</span>
                  <span className="text-xs text-slate-500">confidence: {Math.round(result.investigation.confidence * 100)}%</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-white">label: <span className="text-purple-300">{result.investigation.label}</span></span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-sm text-white">recomendación: <span className="text-yellow-300">{result.investigation.recommendation}</span></span>
                </div>
                <p className="text-xs text-slate-400">{result.investigation.reasoning_brief}</p>
                {result.investigation.hitl_required && (
                  <p className="text-xs text-yellow-400 mt-2 font-mono">⚑ humano debe aprobar antes de publicar</p>
                )}
              </div>

              {/* Run IDs */}
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs text-slate-600 font-mono">
                  run_ids · triage: {result.run_ids.triage.slice(0, 8)}… · investigator: {result.run_ids.investigator.slice(0, 8)}…
                </p>
                {result.replay && (
                  <p className="text-xs text-amber-400 font-mono mt-1">↺ replay: respuestas previas cacheadas (idempotencia activa)</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}