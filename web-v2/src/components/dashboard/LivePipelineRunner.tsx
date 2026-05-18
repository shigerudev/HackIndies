'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react'
import { fetchPresets, runPreset, resetEvent, type DemoPreset, type PipelineResult } from '@/lib/demo-api'
import { Disclosure } from './primitives/Disclosure'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
}

type StepKey = 'ingest' | 'triage' | 'investigate' | 'hitl'
type StepStatus = 'idle' | 'running' | 'done' | 'error'

interface Step {
  key: StepKey
  label: string
  status: StepStatus
  detail?: string
  latencyMs?: number
}

const STEP_DEFS: { key: StepKey; label: string }[] = [
  { key: 'ingest',       label: 'Ingesta'       },
  { key: 'triage',       label: 'Triage'        },
  { key: 'investigate',  label: 'Investigate'  },
  { key: 'hitl',         label: 'Revisión HITL' },
]

function StepDot({ status }: { status: StepStatus }) {
  if (status === 'done')    return <CheckCircle2 size={14} className="text-emerald-400/80" />
  if (status === 'running') return <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-3 h-3 rounded-full bg-cyan-400 block" />
  if (status === 'error')   return <XCircle size={14} className="text-red-400/80" />
  return <Clock size={14} className="text-white/20" />
}

function PipelineSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <StepDot status={s.status} />
          <span className={`text-[11px] font-medium ${s.status === 'done' ? 'text-white/60' : s.status === 'running' ? 'text-cyan-400' : 'text-white/25'}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-white/15 text-[10px] mx-0.5">›</span>}
        </div>
      ))}
    </div>
  )
}

function MetricPill({ label, value, accent = 'neutral' }: { label: string; value: string; accent?: string }) {
  const accentMap: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-amber-400',
    ok: 'text-emerald-400/80',
    neutral: 'text-white/60',
  }
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl aleo-metric">
      <span className={`text-[18px] font-semibold font-mono ${accentMap[accent] ?? accentMap.neutral}`}>{value}</span>
      <span className="text-[10px] text-white/30 tracking-wide uppercase">{label}</span>
    </div>
  )
}

export default function LivePipelineRunner() {
  const [presets, setPresets] = useState<Record<string, DemoPreset> | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [steps, setSteps] = useState<Step[]>(
    STEP_DEFS.map((d) => ({ key: d.key, label: d.label, status: 'idle' }))
  )
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalMs, setTotalMs] = useState<number | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetchPresets()
      .then((r) => {
        setPresets(r.data)
        if (Object.keys(r.data).length > 0 && !selectedId) {
          setSelectedId(Object.keys(r.data)[0])
        }
      })
      .catch(() => setPresets({}))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(async () => {
    if (!selectedId || running) return
    setRunning(true)
    setError(null)
    setResult(null)
    setTotalMs(null)
    setSteps(STEP_DEFS.map((d) => ({ key: d.key, label: d.label, status: 'idle' })))

    const t0 = Date.now()

    for (const { key } of STEP_DEFS) {
      setSteps((prev) => prev.map((s) => s.key === key ? { ...s, status: 'running' as StepStatus } : s))
      await new Promise((r) => setTimeout(r, 500))
      setSteps((prev) => prev.map((s) => s.key === key ? { ...s, status: 'done' as StepStatus } : s))
    }

    try {
      const res = await runPreset(selectedId)
      const elapsed = Date.now() - t0
      setTotalMs(elapsed)
      setResult(res)
      window.dispatchEvent(new CustomEvent('nomad:events-changed'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setRunning(false)
    }
  }, [selectedId, running])

  const handleReset = useCallback(async () => {
    if (!result?.event_id) return
    const eventId = result.event_id
    setSteps(STEP_DEFS.map((d) => ({ key: d.key, label: d.label, status: 'idle' })))
    setResult(null)
    setError(null)
    setTotalMs(null)
    setSelectedId(null)
    await resetEvent(eventId)
    window.dispatchEvent(new CustomEvent('nomad:events-changed'))
  }, [result])

  const hasResult = result !== null

  return (
    <motion.section
      id="pipeline"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="section-pad"
    >
      <motion.div variants={item} className="mb-8 max-w-4xl">
        <p className="eyebrow">Pipeline en vivo</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight mb-2">
          Ejecutá un escenario completo{' '}
          <span className="serif-accent text-white/50">y mirá las stats actualizarse.</span>
        </h2>
        <p className="text-[13px] text-white/35">
          Elige un preset. El pipeline corre Triage + Investigator + HITL.
          Al terminar, los gráficos del dashboard se refrescan al instante.
        </p>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/25 mb-3">Escenario</p>
        <div className="flex flex-wrap gap-2">
          {presets && Object.values(presets).map((p) => {
            const sevColors: Record<string, string> = {
              critical: 'border-red-500/40 bg-red-500/5',
              high: 'border-amber-500/40 bg-amber-500/5',
              medium: 'border-yellow-500/40 bg-yellow-500/5',
              low: 'border-white/10 bg-white/[0.02]',
            }
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-4 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                  selectedId === p.id
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-white/45 hover:text-white/75 hover:border-white/20'
                } ${sevColors[p.severity] ?? ''}`}
              >
                {p.label}
              </button>
            )
          })}
          {presets === null && (
            <span className="text-[12px] text-white/30 animate-pulse">Cargando presets…</span>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={run}
          disabled={!selectedId || running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-semibold text-black transition-colors"
        >
          <Play size={13} strokeWidth={2.2} fill="currentColor" />
          {running ? 'Corriendo…' : 'Ejecutar preset'}
        </button>

        <PipelineSteps steps={steps} />

        {totalMs !== null && !running && (
          <span className="text-[11px] text-white/30 font-mono ml-auto">
            {totalMs}ms total
          </span>
        )}
      </motion.div>

      {error && (
        <motion.div variants={item} className="mb-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-[12px] text-red-400/80 font-mono">{error}</p>
          <p className="text-[11px] text-white/30 mt-1">Verificá que DEMO_MODE=true y el backend esté corriendo.</p>
        </motion.div>
      )}

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricPill label="Credenciales" value={result!.triage.credentials_count_estimate.toLocaleString('es')} accent="critical" />
            <MetricPill label="Severidad" value={result!.triage.severity.toUpperCase()} accent={result!.triage.severity === 'critical' ? 'critical' : result!.triage.severity === 'high' ? 'high' : 'ok'} />
            <MetricPill label="Investigador" value={result!.investigation.label} accent="neutral" />
            <MetricPill label="HITL" value={result!.hitl_status === 'approved' ? 'Aprobado' : 'Pendiente'} accent={result!.hitl_status === 'approved' ? 'ok' : 'high'} />
          </div>

          <div className="card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-cyan-400/70">TRIAGE</span>
              <span className="text-[10px] text-white/25 font-mono">confidence {Math.round(result!.triage.confidence * 100)}%</span>
              {result!.mock && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80 border border-amber-500/20">mock</span>}
            </div>
            <p className="text-[13px] font-semibold text-white/80">{result!.triage.suggested_title}</p>
            <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{result!.triage.reasoning_brief}</p>
          </div>

          <div className="card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-purple-400/70">INVESTIGATOR</span>
              <span className="text-[10px] text-white/25 font-mono">confidence {Math.round(result!.investigation.confidence * 100)}%</span>
              {result!.investigation.hitl_required && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300/80 border border-yellow-500/20">
                  <Zap size={9} className="inline mr-0.5" /> humano debe aprobar
                </span>
              )}
            </div>
            <p className="text-[13px] text-white/60">
              Recomendación: <span className="text-white/80 font-medium">{result!.investigation.recommendation}</span>
            </p>
            <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{result!.investigation.reasoning_brief}</p>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-[12px] font-medium text-white/45 hover:text-white/70 transition-colors"
          >
            <RotateCcw size={12} />
            Resetear y repetir
          </button>

          <Disclosure label="Ver detalles técnicos">
            <pre className="text-[10px] font-mono text-white/35 bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 overflow-auto">
{JSON.stringify(result, null, 2)}
            </pre>
          </Disclosure>
        </motion.div>
      )}
    </motion.section>
  )
}