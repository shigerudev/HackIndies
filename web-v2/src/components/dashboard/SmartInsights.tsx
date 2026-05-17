'use client'

import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts'
import { useEvents } from '@/hooks/useEvents'
import { useInstitutions } from '@/hooks/useInstitutions'
import { useHealth } from '@/hooks/useHealth'
import type { ExposureEvent } from '@/lib/api'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
}

interface Kpi {
  id: string
  label: string
  value: string
  delta: string
  spark: number[]
  accent: 'critical' | 'high' | 'ok' | 'info' | 'neutral'
}

function severityCount(events: ExposureEvent[], sev: ExposureEvent['severity']) {
  return events.filter((e) => e.severity === sev).length
}

function countsPerRecentDay(events: ExposureEvent[], predicate: (e: ExposureEvent) => boolean, days = 14): number[] {
  const now = Date.now()
  const counts = Array.from({ length: days }, () => 0)
  events.forEach((e) => {
    if (!predicate(e)) return
    const seen = new Date(e.first_seen_at).getTime()
    const diff = Math.floor((now - seen) / 86_400_000)
    if (diff >= 0 && diff < days) counts[days - 1 - diff]++
  })
  return counts
}

function buildKpis(events: ExposureEvent[], institutionCount: number, online: boolean | null): Kpi[] {
  const critical = severityCount(events, 'critical')
  const high = severityCount(events, 'high')
  const pending = events.filter((e) => e.status === 'pending_review').length
  const published = events.filter((e) => e.status === 'published').length
  const total = events.length

  const severitySpark = countsPerRecentDay(events, (e) => e.severity === 'critical' || e.severity === 'high')
  const pendingSpark = countsPerRecentDay(events, (e) => e.status === 'pending_review')
  const institutionSpark = Array.from({ length: 14 }, () => institutionCount)
  const publishedSpark = countsPerRecentDay(events, (e) => e.status === 'published')

  return [
    {
      id: 'threats',
      label: 'Eventos alta severidad',
      value: String(critical + high),
      delta: critical + high === 0 ? 'Sin critical/high en el dataset actual' : `${critical} críticos · ${high} altos`,
      spark: severitySpark,
      accent: critical + high > 0 ? 'critical' : 'ok',
    },
    {
      id: 'pending',
      label: 'Cola HITL',
      value: String(pending),
      delta: pending === 0 ? 'Sin eventos pendientes de revisión' : 'Esperando decisión humana',
      spark: pendingSpark,
      accent: pending > 0 ? 'high' : 'ok',
    },
    {
      id: 'institutions',
      label: 'Instituciones',
      value: String(institutionCount),
      delta: online === false ? 'API no disponible' : 'Catálogo institucional del servidor',
      spark: institutionSpark,
      accent: 'info',
    },
    {
      id: 'published',
      label: 'Publicados',
      value: online === false ? '—' : String(published),
      delta: online === false ? 'Sin datos: API sin respuesta' : `${published} de ${total} eventos cargados tienen estado «published»`,
      spark: online === false ? Array(14).fill(0) : publishedSpark,
      accent: online === false ? 'critical' : 'ok',
    },
  ]
}

const ACCENT_STROKE: Record<Kpi['accent'], string> = {
  critical: 'rgba(226, 106, 90, 0.75)',
  high: 'rgba(212, 164, 90, 0.75)',
  ok: 'rgba(110, 193, 138, 0.75)',
  info: 'rgba(127, 177, 196, 0.75)',
  neutral: 'rgba(255, 255, 255, 0.55)',
}
const ACCENT_FILL: Record<Kpi['accent'], string> = {
  critical: 'rgba(226, 106, 90, 0.25)',
  high: 'rgba(212, 164, 90, 0.25)',
  ok: 'rgba(110, 193, 138, 0.25)',
  info: 'rgba(127, 177, 196, 0.25)',
  neutral: 'rgba(255, 255, 255, 0.22)',
}

function Spark({ data, id, stroke, fill }: { data: number[]; id: string; stroke: string; fill: string }) {
  const points = data.map((v, i) => ({ v, i }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.4} fill={`url(#spark-${id})`} dot={false} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MiniLine({ data, id, stroke }: { data: number[]; id: string; stroke: string }) {
  const points = data.map((v, i) => ({ v, i }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.4} dot={false} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  )
}

const ACCENT_DOT: Record<Kpi['accent'], string> = {
  critical: 'dot-critical',
  high: 'dot-high',
  ok: 'dot-ok',
  info: 'dot-info',
  neutral: 'dot-low',
}

export default function SmartInsights() {
  const { events, error: eventsError } = useEvents({ pollMs: 30_000 })
  const { institutions } = useInstitutions()
  const { online } = useHealth()
  const kpis = buildKpis(events, institutions.length, online)

  return (
    <motion.section
      id="insights"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className="section-pad"
    >
      <motion.div variants={item} className="mb-9 max-w-2xl">
        <p className="eyebrow">Resumen</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
          Datos desde el backend,{' '}
          <span className="serif-accent text-white/50">sin rellenos inventados.</span>
        </h2>
        {eventsError && (
          <p className="mt-2 text-[12px] text-red-400/70">{eventsError} — reintentando en 30s</p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((k, idx) => (
          <motion.div
            key={k.id}
            variants={item}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring' as const, stiffness: 380, damping: 22 }}
            className="kpi cursor-default"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`dot ${ACCENT_DOT[k.accent]}`} />
                <span className="kpi-label truncate">{k.label}</span>
              </div>
              <span className="text-[9.5px] font-mono text-white/22 tracking-wider">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-end gap-3 mt-1">
              <span className="kpi-value flex-shrink-0">{k.value}</span>
              <div className="flex-1 h-9 -mb-1 min-w-0">
                {idx % 2 === 0 ? (
                  <Spark data={k.spark} id={k.id} stroke={ACCENT_STROKE[k.accent]} fill={ACCENT_FILL[k.accent]} />
                ) : (
                  <MiniLine data={k.spark} id={k.id} stroke={ACCENT_STROKE[k.accent]} />
                )}
              </div>
            </div>

            <p className="kpi-delta truncate">{k.delta}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}