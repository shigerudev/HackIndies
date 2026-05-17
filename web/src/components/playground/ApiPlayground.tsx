'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Loader2,
  ChevronDown,
  AlertTriangle,
  RotateCw,
  Brain,
  Telescope,
  Workflow,
  Sparkles,
  Check,
  CalendarClock,
} from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { useAgentRun, type AgentAction } from '@/hooks/useAgentRun'
import { Disclosure } from '@/components/dashboard/primitives/Disclosure'
import { cn } from '@/lib/utils'
import type { ExposureEvent } from '@/services/api/client'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
}

const ACTIONS: Array<{
  id: AgentAction
  icon: typeof Brain
  label: string
  description: string
  endpoint: string
}> = [
  {
    id: 'triage',
    icon: Brain,
    label: 'Clasificar',
    description: 'Solo Triage. Asigna severidad y sugiere título.',
    endpoint: 'POST /api/agent/triage',
  },
  {
    id: 'investigate',
    icon: Telescope,
    label: 'Investigar',
    description: 'Solo Investigator. Verifica y recomienda acción.',
    endpoint: 'POST /api/agent/investigate',
  },
  {
    id: 'pipeline',
    icon: Workflow,
    label: 'Pipeline completo',
    description: 'Triage + Investigator + estado HITL en una llamada.',
    endpoint: 'POST /api/agent/pipeline',
  },
]

function severityDot(sev: ExposureEvent['severity']) {
  return sev === 'critical' ? 'dot-critical'
    : sev === 'high'        ? 'dot-high'
    : sev === 'medium'      ? 'dot-medium'
    : 'dot-low'
}

function severityPill(sev: ExposureEvent['severity']) {
  return sev === 'critical' ? 'pill-sev pill-sev-critical'
    : sev === 'high'        ? 'pill-sev pill-sev-high'
    : sev === 'medium'      ? 'pill-sev pill-sev-medium'
    : 'pill-sev pill-sev-low'
}

function formatRelativeEs(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} m`
  if (diff < 86_400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86_400)} d`
}

function EventPicker({
  events,
  loading,
  selectedId,
  onSelect,
  disabled,
}: {
  events: ExposureEvent[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = events.find((e) => e.id === selectedId)

  // Group by status so the user can scan: pending first (action needed), then the rest
  const groups: Array<{ key: string; label: string; items: ExposureEvent[] }> = [
    { key: 'pending_review', label: 'Esperando revisión', items: events.filter((e) => e.status === 'pending_review') },
    { key: 'approved',       label: 'Aprobados',          items: events.filter((e) => e.status === 'approved') },
    { key: 'published',      label: 'Publicados',         items: events.filter((e) => e.status === 'published') },
    { key: 'rejected',       label: 'Rechazados',         items: events.filter((e) => e.status === 'rejected') },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen(!open)}
        disabled={disabled || loading}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-4 rounded-xl glass glass-inner text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'bg-white/[0.06] border-white/[0.14]'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-white/55" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-semibold tracking-[0.16em] uppercase text-white/30 mb-0.5">
              Evento
            </p>
            <p className="text-[13.5px] font-medium text-white/85 truncate leading-tight">
              {loading
                ? 'Cargando eventos…'
                : selected
                  ? selected.title
                  : 'Seleccionar evento…'}
            </p>
            {selected && (
              <p className="text-[10.5px] text-white/35 mt-1 truncate">
                {selected.institution_name} · severidad {SEVERITY_LABEL[selected.severity]}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* click-away */}
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 z-30 rounded-2xl border border-white/[0.12] bg-[#151515] shadow-2xl overflow-hidden backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#121212]">
                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/45">
                  {events.length} evento{events.length === 1 ? '' : 's'} disponibles
                </p>
                <p className="text-[10px] text-white/30 font-mono">
                  /api/events
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto py-2 bg-[#151515]">
                {groups.map((group, gi) => (
                  <div key={group.key} className={cn(gi > 0 && 'mt-2')}>
                    <p className="px-4 pt-2 pb-1.5 text-[9.5px] font-bold tracking-[0.16em] uppercase text-white/25">
                      {group.label}
                      <span className="ml-2 font-mono text-white/20">{group.items.length}</span>
                    </p>
                    <div className="px-1.5">
                      {group.items.map((e) => {
                        const isSel = e.id === selectedId
                        return (
                          <button
                            key={e.id}
                            onClick={() => { onSelect(e.id); setOpen(false) }}
                            className={cn(
                              'w-full text-left px-3 py-3 rounded-lg transition-colors flex items-start gap-3 group',
                              isSel ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'
                            )}
                          >
                            <span className={cn('dot mt-1.5', severityDot(e.severity))} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-[12.5px] font-medium text-white/90 truncate leading-tight flex-1">
                                  {e.title}
                                </p>
                                {isSel && (
                                  <Check size={12} className="text-white/70 shrink-0" strokeWidth={2} />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10.5px] text-white/40 mt-1">
                                <span className="truncate flex-1">{e.institution_name}</span>
                                <span className={cn(severityPill(e.severity), 'shrink-0')}>
                                  {SEVERITY_LABEL[e.severity] ?? e.severity}
                                </span>
                                <span className="inline-flex items-center gap-1 text-white/30 font-mono shrink-0">
                                  <CalendarClock size={9} strokeWidth={1.5} />
                                  {formatRelativeEs(e.first_seen_at)}
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ApiPlayground() {
  const { events, loading: loadingEvents, isMock } = useEvents()
  const { running, result, error, run, reset } = useAgentRun()
  const [eventId, setEventId] = useState<string | null>(null)
  const [action, setAction] = useState<AgentAction>('pipeline')

  // Auto-select first event
  useEffect(() => {
    if (!eventId && events.length > 0) {
      setEventId(events[0].id)
    }
  }, [events, eventId])

  const selectedEvent = events.find((e) => e.id === eventId)
  const canRun = !!eventId && !running && !loadingEvents

  const onRun = async () => {
    if (!eventId) return
    await run(action, eventId)
  }

  return (
    <motion.section
      id="playground"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Agent console</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
          Ejecuta los agentes IA{' '}
          <span className="serif-accent text-white/50">sobre eventos reales.</span>
        </h2>
        <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
          Elige cualquier evento del backend, escoge una acción y observa cómo el agente clasifica,
          investiga y recomienda. Sin saber JSON.
        </p>
        {isMock && (
          <p className="mt-3 inline-flex items-center gap-2 text-[11.5px] text-white/40 bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/35 shrink-0" />
            El API devolvió <code className="font-mono text-white/45">mock:true</code> — revisa la configuración del
            backend antes de tomar decisiones operativas.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: setup */}
        <div className="lg:col-span-5 space-y-4">
          <EventPicker
            events={events}
            loading={loadingEvents}
            selectedId={eventId}
            onSelect={(id) => { setEventId(id); reset() }}
            disabled={running}
          />

          {/* Action selector */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30 px-1">
              Acción a ejecutar
            </p>
            {ACTIONS.map((a) => {
              const Icon = a.icon
              const isActive = action === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => !running && setAction(a.id)}
                  disabled={running}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl flex items-start gap-3 transition-all',
                    isActive
                      ? 'bg-white/[0.07] border border-white/[0.14]'
                      : 'border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.09]',
                    running && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isActive ? 'bg-white/[0.08]' : 'bg-white/[0.04]'
                  )}>
                    <Icon size={13} className={isActive ? 'text-white/80' : 'text-white/45'} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[13px] font-medium leading-snug',
                      isActive ? 'text-white/90' : 'text-white/65'
                    )}>
                      {a.label}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{a.description}</p>
                    <p className="text-[9.5px] font-mono text-white/25 mt-1 tracking-wide">{a.endpoint}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2.5">
            <motion.button
              whileHover={canRun ? { scale: 1.005 } : {}}
              whileTap={canRun ? { scale: 0.99 } : {}}
              onClick={onRun}
              disabled={!canRun}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-[13px] font-semibold transition-colors hover:bg-white/92 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? (
                <><Loader2 size={13} className="animate-spin" /> Ejecutando…</>
              ) : (
                <><Play size={12} fill="currentColor" /> Ejecutar</>
              )}
            </motion.button>

            {(result || error) && !running && (
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl glass glass-inner text-white/55 hover:text-white/85 transition-colors"
                aria-label="Reiniciar"
              >
                <RotateCw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right: result */}
        <div className="lg:col-span-7 min-h-[340px]">
          <AnimatePresence mode="wait">
            {running && (
              <motion.div
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center h-full p-12 rounded-2xl gap-4"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-white/35"
                    />
                  ))}
                </div>
                <p className="text-[12px] text-white/40">
                  {action === 'pipeline' ? 'Ejecutando pipeline · triage → investigación → HITL' :
                   action === 'triage' ? 'Clasificando con Triage agent…' :
                   'Investigando con OSINT interno…'}
                </p>
              </motion.div>
            )}

            {!running && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center h-full p-10 rounded-2xl gap-4 text-center"
              >
                <AlertTriangle size={20} className="text-white/35" strokeWidth={1.5} />
                <div>
                  <p className="text-[14px] text-white/70 font-medium mb-1.5">
                    No se pudo ejecutar
                  </p>
                  <p className="text-[12px] text-white/40 leading-relaxed max-w-sm">
                    {error.includes('fetch') || error.includes('Failed')
                      ? 'No hay conexión con el backend. Asegúrate que esté corriendo en localhost:3001.'
                      : error}
                  </p>
                </div>
              </motion.div>
            )}

            {!running && !error && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {result.triage && (
                  <div className="card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <p className="eyebrow !mb-0">Clasificación</p>
                      <span className="text-[10px] text-white/30 font-mono">{result.duration_ms}ms</span>
                    </div>
                    <h3 className="text-[15.5px] font-semibold text-white/90 leading-snug mb-2">
                      {result.triage.suggested_title}
                    </h3>
                    <p className="text-[12.5px] text-white/55 leading-relaxed mb-5">
                      {result.triage.suggested_summary}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/[0.06]">
                      <div>
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Severidad</p>
                        <span className={cn(severityPill(result.triage.severity), 'inline-flex')}>
                          {SEVERITY_LABEL[result.triage.severity] ?? result.triage.severity}
                        </span>
                      </div>
                      <div>
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/25 mb-1">Confianza</p>
                        <p className="text-[12.5px] text-white/85 font-medium">
                          {Math.round(result.triage.confidence * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/25 mb-1">Credenciales est.</p>
                        <p className="text-[12.5px] text-white/85 font-medium">
                          {result.triage.credentials_count_estimate.toLocaleString('es')}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/40 italic mt-4">
                      {result.triage.reasoning_brief}
                    </p>
                  </div>
                )}

                {result.investigation && (
                  <div className="card p-6 rounded-2xl">
                    <p className="eyebrow !mb-4">Investigación</p>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={cn(
                        'dot shrink-0 mt-2',
                        result.investigation.hitl_required ? 'dot-warn pulse-dot' : 'dot-ok'
                      )} />
                      <div className="flex-1">
                        <p className="text-[13.5px] text-white/90 font-medium">
                          {result.investigation.recommendation === 'approve_for_review'
                            ? 'Aprobar para revisión humana'
                            : result.investigation.recommendation === 'needs_more_info'
                            ? 'Requiere más información'
                            : 'Rechazar — sin evidencia suficiente'}
                        </p>
                        <p className="text-[12px] text-white/45 leading-relaxed mt-1.5">
                          {result.investigation.reasoning_brief}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/[0.06]">
                      <div>
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Etiqueta</p>
                        <p className="text-[12.5px] text-white/85 font-medium capitalize">
                          {result.investigation.label.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/25 mb-1.5">HITL</p>
                        <p className={cn(
                          'pill-status inline-flex',
                          result.investigation.hitl_required ? 'pill-status-pending' : 'pill-status-published'
                        )}>
                          {result.investigation.hitl_required ? 'Requerido' : 'No requerido'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Disclosure label="Ver respuesta JSON completa">
                  <pre className="text-[11px] font-mono text-white/45 bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 overflow-auto max-h-72">
{JSON.stringify(result.raw, null, 2)}
                  </pre>
                </Disclosure>
              </motion.div>
            )}

            {!running && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center h-full p-10 rounded-2xl gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <Play size={14} className="text-white/45" fill="currentColor" />
                </div>
                <p className="text-[13px] text-white/55 text-center max-w-xs leading-relaxed">
                  Elige un evento y una acción, luego presiona{' '}
                  <span className="text-white/85 font-medium">Ejecutar</span> para ver el resultado humanizado.
                </p>
                {selectedEvent && (
                  <p className="text-[11px] text-white/30 text-center max-w-xs">
                    Listo para correr: <span className="text-white/55 font-mono">{ACTIONS.find(a => a.id === action)?.endpoint}</span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}
