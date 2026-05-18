'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/ui/Toolbar';
import { Tag } from '@/components/ui/Tag';
import { Spinner } from '@/components/ui/Spinner';
import { runPreset, fetchPresets, type PipelineResult } from '@/lib/demo-api';
import type { DemoPreset } from '@/lib/demo-api';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

type StepStatus = 'idle' | 'running' | 'done' | 'error';

type DemoStep = {
  label: string;
  status: StepStatus;
  output?: string;
};

const PRESET_IDS = ['digecam', 'mintrab'] as const;

export default function DemoPage() {
  const [presets, setPresets] = useState<Record<string, DemoPreset>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('digecam');
  const [steps, setSteps] = useState<DemoStep[]>([
    { label: 'Ingesta de senal OSINT', status: 'idle' },
    { label: 'Triage automatico', status: 'idle' },
    { label: 'Investigate (verificacion)', status: 'idle' },
    { label: 'HITL - Revision humana', status: 'idle' },
    { label: 'Defender - Playbook', status: 'idle' },
    { label: 'Ciudadano - Notificacion', status: 'idle' },
  ]);
  const [running, setRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPresets() {
    try {
      const res = await fetchPresets();
      setPresets(res.data);
      if (!selectedPreset && Object.keys(res.data).length > 0) {
        setSelectedPreset(Object.keys(res.data)[0]);
      }
    } catch {
      // fallback presets
      setPresets({});
    }
  }

  async function runDemo() {
    setRunning(true);
    setError(null);
    setFinalResult(null);
    setSteps([
      { label: 'Ingesta de senal OSINT', status: 'idle' },
      { label: 'Triage automatico', status: 'idle' },
      { label: 'Investigate (verificacion)', status: 'idle' },
      { label: 'HITL - Revision humana', status: 'idle' },
      { label: 'Defender - Playbook', status: 'idle' },
      { label: 'Ciudadano - Notificacion', status: 'idle' },
    ]);

    const stepLabels = [
      'Ingesta de senal OSINT',
      'Triage automatico',
      'Investigate (verificacion)',
      'HITL - Revision humana',
      'Defender - Playbook',
      'Ciudadano - Notificacion',
    ];

    for (let i = 0; i < stepLabels.length; i++) {
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s))
      );
      await new Promise((r) => setTimeout(r, 600));
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s))
      );
    }

    try {
      const result = await runPreset(selectedPreset);
      setFinalResult(result);

      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === 3 && result.hitl_status === 'approved') {
            return { ...s, status: 'done', output: 'Aprobado por revisor (mock)' };
          }
          return s;
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en el demo');
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Toolbar
        eyebrow="Demo guiado"
        title="Demo en vivo"
        meta="Recorre el pipeline completo Triage → Investigator → HITL → Defender → Ciudadano"
        actions={
          running ? (
            <Tag variant="amber">
              <Spinner size={12} />
              Ejecutando…
            </Tag>
          ) : (
            <button
              type="button"
              onClick={runDemo}
              className="btn btn-primary"
            >
              <Play size={14} />
              Ejecutar demo
            </button>
          )
        }
      />

      <div className="page-content">
        {/* Preset selector */}
        {Object.keys(presets).length > 0 && (
          <div className="card mb-4">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12 }}>
              Seleccionar escenario
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(presets).map(([id, preset]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedPreset(id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    border: '1px solid',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all var(--t-fast)',
                    background: selectedPreset === id ? 'rgba(34,211,238,0.10)' : 'var(--bg-inset)',
                    borderColor: selectedPreset === id ? 'var(--border-strong)' : 'var(--border-subtle)',
                    color: selectedPreset === id ? 'var(--brand-cyan)' : 'var(--fg-secondary)',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps timeline */}
        <div className="card">
          <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 20 }}>
            Pipeline de agentes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: 16,
                  alignItems: 'center',
                  paddingBottom: 20,
                  position: 'relative',
                }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 15,
                      top: 32,
                      bottom: 0,
                      width: 2,
                      background:
                        step.status === 'done'
                          ? 'var(--brand-cyan)'
                          : 'var(--border-subtle)',
                    }}
                  />
                )}

                {/* Status icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: '2px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    background: 'var(--bg-base)',
                    borderColor:
                      step.status === 'running'
                        ? 'var(--brand-cyan)'
                        : step.status === 'done'
                        ? 'var(--accent-emerald)'
                        : step.status === 'error'
                        ? 'var(--accent-rose)'
                        : 'var(--border-subtle)',
                  }}
                >
                  {step.status === 'idle' && (
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--fg-muted)' }} />
                  )}
                  {step.status === 'running' && (
                    <Spinner size={14} />
                  )}
                  {step.status === 'done' && (
                    <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                  )}
                  {step.status === 'error' && (
                    <XCircle size={16} style={{ color: 'var(--accent-rose)' }} />
                  )}
                </div>

                {/* Content */}
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color:
                        step.status === 'idle'
                          ? 'var(--fg-muted)'
                          : 'var(--fg-primary)',
                    }}
                  >
                    {step.label}
                  </div>
                  {step.output && (
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4, fontFamily: 'var(--font-jetbrains)' }}>
                      {step.output}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final result */}
        {finalResult && (
          <div className="card" style={{ marginTop: 16, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: 12 }}>
              Resultado del pipeline
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--fg-muted)' }}>severity: </span>
                <span style={{ color: 'var(--brand-cyan)' }}>{finalResult.triage.severity}</span>
                <span style={{ marginLeft: 16, fontFamily: 'var(--font-jetbrains)', color: 'var(--fg-muted)' }}>confianza triage: </span>
                <span>{(finalResult.triage.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--fg-muted)' }}>investigation label: </span>
                <span style={{ color: 'var(--sev-medium)' }}>{finalResult.investigation.label}</span>
                <span style={{ marginLeft: 16 }}>hitl_required: </span>
                <Tag variant={finalResult.investigation.hitl_required ? 'amber' : 'green'}>
                  {finalResult.investigation.hitl_required ? 'SI' : 'NO'}
                </Tag>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--fg-muted)' }}>HITL status: </span>
                <Tag variant={finalResult.hitl_status === 'approved' ? 'green' : 'amber'}>{finalResult.hitl_status}</Tag>
                {finalResult.mock && <Tag variant="amber" className="tag-ml">mock</Tag>}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="card" style={{ marginTop: 16, borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)' }}>
            <div style={{ fontSize: 13, color: 'var(--accent-rose)' }}>Error: {error}</div>
          </div>
        )}

        {/* Hint */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--fg-muted)' }}>
          Demo conectado al backend de producción.{' '}
          <a
            href="/app/playground"
            style={{ color: 'var(--brand-cyan)', textDecoration: 'none', marginTop: 8, display: 'inline-block' }}
          >
            Ir al playground →
          </a>
        </div>
      </div>
    </>
  );
}