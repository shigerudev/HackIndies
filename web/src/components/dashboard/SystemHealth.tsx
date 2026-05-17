'use client'

import { motion } from 'framer-motion'
import { useHealth } from '@/hooks/useHealth'
import { Disclosure } from './primitives/Disclosure'

interface Signal {
  name: string
  ok: boolean
  human: string
  detail: string
}

function buildSignals(health: ReturnType<typeof useHealth>['health']): Signal[] {
  return [
    {
      name: 'Supabase',
      ok: !!health?.supabase,
      human: health?.supabase
        ? 'Base de datos respondiendo correctamente'
        : 'Sin conexión a Supabase — usando datos de respaldo',
      detail: 'GET /api/health → { supabase }',
    },
    {
      name: 'MiniMax',
      ok: !!health?.minimax,
      human: health?.minimax
        ? 'Modelo de IA activo y disponible'
        : 'Modelo no configurado — agentes corren en modo mock',
      detail: 'GET /api/health → { minimax }',
    },
    {
      name: 'Make Webhook',
      ok: !!health?.make_webhook,
      human: health?.make_webhook
        ? 'Webhook de ingesta listo para recibir señales'
        : 'Webhook no configurado — ingesta automática deshabilitada',
      detail: 'GET /api/health → { make_webhook }',
    },
  ]
}

function summarize(signals: Signal[]): { state: 'healthy' | 'degraded' | 'down'; line: string } {
  const ok = signals.filter((s) => s.ok).length
  if (ok === signals.length) return { state: 'healthy', line: 'Todos los servicios operativos.' }
  if (ok === 0) return { state: 'down', line: 'Backend offline o sin configurar.' }
  return { state: 'degraded', line: `${ok} de ${signals.length} servicios activos.` }
}

export default function SystemHealth() {
  const { health, loading, online } = useHealth()
  const signals = buildSignals(health)
  const summary = summarize(signals)

  const summaryClass =
    summary.state === 'healthy' ? 'text-white/85'
    : summary.state === 'degraded' ? 'text-white/65'
    : 'text-white/35'

  return (
    <motion.section
      id="system-health"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="max-w-3xl">
        <p className="eyebrow">Estado del sistema</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight mb-3">
          {loading ? (
            <span className="text-white/40">Comprobando servicios…</span>
          ) : online === false ? (
            <>Sin conexión al <span className="serif-accent text-white/50">servicio backend.</span></>
          ) : (
            <>Todo opera <span className="serif-accent text-white/50">con normalidad.</span></>
          )}
        </h2>
        <p className={`text-[15px] leading-relaxed mb-10 ${summaryClass}`}>
          {summary.line}
        </p>

        {/* Per-service human readout */}
        <div className="space-y-3 mb-8">
          {signals.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card flex items-center gap-4 p-4 rounded-xl"
            >
              <span
                className={`dot shrink-0 ${
                  loading ? 'dot-down' : s.ok ? 'dot-ok pulse-dot' : 'dot-down'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/80 font-medium leading-tight">{s.human}</p>
              </div>
              <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30 shrink-0">
                {s.name}
              </span>
            </motion.div>
          ))}
        </div>

        <Disclosure label="Ver respuesta técnica /api/health">
          <pre className="text-[11px] font-mono text-white/45 bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 overflow-auto">
{JSON.stringify(health ?? { status: 'no-response' }, null, 2)}
          </pre>
        </Disclosure>
      </div>
    </motion.section>
  )
}
