'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useEvents } from '@/hooks/useEvents'
import type { ExposureEvent } from '@/services/api/client'

const TABS = [
  { id: 'volume',      label: 'Volumen'      },
  { id: 'severity',    label: 'Severidad'    },
  { id: 'institutions', label: 'Instituciones' },
] as const
type TabId = typeof TABS[number]['id']

const PIE_WHITES = [
  'rgba(255,255,255,0.78)',
  'rgba(255,255,255,0.58)',
  'rgba(255,255,255,0.42)',
  'rgba(255,255,255,0.28)',
  'rgba(255,255,255,0.18)',
]

interface TooltipPayload {
  name?: string
  value?: number
  payload?: Record<string, unknown>
}

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass glass-inner rounded-xl px-3 py-2 text-[12px]">
      {label && <p className="text-white/35 mb-1.5 font-mono">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-white/70 font-medium">
          {p.name}: <span className="text-white/90">{p.value?.toLocaleString('es')}</span>
        </p>
      ))}
    </div>
  )
}

/** Tooltip barras por severidad: Recharts marca la serie como "Eventos" — mostramos el nombre del eje X. */
function SeverityTooltip({ active, payload }: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const row =
    payload[0]?.payload && typeof payload[0].payload === 'object'
      ? (payload[0].payload as { name?: string; value?: number })
      : (payload[0] as unknown as { name?: string; value?: number })
  const sevLabel = typeof row?.name === 'string' ? row.name : 'Severidad'
  const count =
    typeof row?.value === 'number' ? row.value : Number(payload[0]?.value ?? 0)
  return (
    <div className="glass glass-inner rounded-xl px-3 py-2 text-[12px]">
      <p className="text-white/45 mb-0.5 font-mono text-[11px]">Severidad</p>
      <p className="text-white/85 font-medium">
        <span className="text-white/90">{sevLabel}</span>
        {' · '}
        <span>{Number.isFinite(count) ? count.toLocaleString('es') : '—'} eventos</span>
      </p>
    </div>
  )
}

/** Inicio del día UTC (ms) para alinear barras sin desfases TZ. */
function utcDayStart(ms: number) {
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Número de calendarios UTC entre día del evento y día de referencia (no negativo si evento está en pasado). */
function utcWholeDaysBetweenSeenAndEnd(seenIso: string, endMs: number) {
  const seen = utcDayStart(new Date(seenIso).getTime())
  const end = utcDayStart(endMs)
  return Math.floor((end - seen) / 86_400_000)
}

/** Volumen mínimo/max días UTC (adaptamos la ventana para cubrir tus eventos cargados). */
const VOLUME_WINDOW_MIN_DAYS = 56
const VOLUME_WINDOW_CAP_DAYS = 400

const VOLUME_VIEWS = [
  { id: 'area_daily' as const, label: 'Área · día a día', hint: 'Tendencia suave sobre cada día' },
  { id: 'bars_daily' as const, label: 'Barras · día a día', hint: 'Cada día es una columna (mejor si hay huecos)' },
  { id: 'bars_weekly' as const, label: 'Barras · semana UTC', hint: 'Agrupa 7 días: menos puntos vacíos en series largas' },
]
type VolumeViewId = (typeof VOLUME_VIEWS)[number]['id']

/** Apila otros severidades vs críticos para barras día/semana */
function enrichDailyForStack(daily: { day: string; total: number; critical: number }[]) {
  return daily.map((d) => ({
    ...d,
    otros: Math.max(0, d.total - d.critical),
  }))
}

/** Suma últimos buckets en bloques de 7 (de más viejo → más nuevo, alineados al array diario UTC). */
function rollupWeeksFromDaily(daily: { day: string; total: number; critical: number }[]) {
  const rows: { label: string; total: number; critical: number; otros: number }[] = []
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, Math.min(i + 7, daily.length))
    if (chunk.length === 0) continue
    const total = chunk.reduce((s, d) => s + d.total, 0)
    const critical = chunk.reduce((s, d) => s + d.critical, 0)
    rows.push({
      label: `${chunk[0].day} → ${chunk[chunk.length - 1].day}`,
      total,
      critical,
      otros: Math.max(0, total - critical),
    })
  }
  return rows
}

/** Bucket por día UTC con ventana que termina en «hoy» UTC */
function bucketByDay(events: ExposureEvent[]): { day: string; total: number; critical: number }[] {
  const now = Date.now()

  let windowDays = VOLUME_WINDOW_MIN_DAYS
  if (events.length > 0) {
    let oldestDay = utcDayStart(now)
    for (const e of events) {
      oldestDay = Math.min(oldestDay, utcDayStart(new Date(e.first_seen_at).getTime()))
    }
    const spanSinceOldestInclusive =
      Math.floor((utcDayStart(now) - oldestDay) / 86_400_000) + 1
    windowDays = Math.min(
      VOLUME_WINDOW_CAP_DAYS,
      Math.max(VOLUME_WINDOW_MIN_DAYS, spanSinceOldestInclusive)
    )
  }

  const buckets: { day: string; total: number; critical: number }[] = []

  for (let i = windowDays - 1; i >= 0; i--) {
    const t = utcDayStart(now) - i * 86_400_000
    const date = new Date(t)
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    buckets.push({
      day: `${dd}/${mm}`,
      total: 0,
      critical: 0,
    })
  }

  events.forEach((e) => {
    const age = utcWholeDaysBetweenSeenAndEnd(e.first_seen_at, now)
    if (age >= 0 && age < windowDays) {
      const idx = windowDays - 1 - age
      buckets[idx].total++
      if (e.severity === 'critical') buckets[idx].critical++
    }
  })
  return buckets
}

function severityBreakdown(events: ExposureEvent[]) {
  const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 }
  const map: Record<ExposureEvent['severity'], keyof typeof counts> = {
    low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
  }
  events.forEach((e) => {
    const key = map[e.severity]
    if (key) counts[key]++
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function institutionBreakdown(events: ExposureEvent[]) {
  const map = new Map<string, number>()
  events.forEach((e) => {
    const key = e.institution_name || e.institution_slug
    map.set(key, (map.get(key) ?? 0) + 1)
  })
  return Array.from(map.entries())
    .map(([name, calls]) => ({ name, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 5)
}

export default function AnalyticsOverview() {
  const [active, setActive] = useState<TabId>('volume')
  const [volumeView, setVolumeView] = useState<VolumeViewId>('bars_daily')
  const { events, loading } = useEvents({ pollMs: 60_000 })

  const dailyBuckets = useMemo(() => bucketByDay(events), [events])
  const dailyStacked = useMemo(() => enrichDailyForStack(dailyBuckets), [dailyBuckets])
  const weeklyStacked = useMemo(() => rollupWeeksFromDaily(dailyBuckets), [dailyBuckets])
  const severities = useMemo(() => severityBreakdown(events), [events])
  const institutions = useMemo(() => institutionBreakdown(events), [events])

  const volumeYMax = useMemo(() => {
    let m = 1
    if (volumeView === 'bars_weekly') {
      for (const w of weeklyStacked) m = Math.max(m, w.total)
    } else {
      for (const b of dailyBuckets) m = Math.max(m, b.total, b.critical)
    }
    return m
  }, [dailyBuckets, weeklyStacked, volumeView])
  const severityYMax = useMemo(() => Math.max(1, ...severities.map((s) => s.value)), [severities])

  const totalEvents = events.length
  const totalCritical = events.filter((e) => e.severity === 'critical').length

  return (
    <motion.section
      id="analytics"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="max-w-xl">
          <p className="eyebrow">Analíticas</p>
          <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
            Eventos detectados{' '}
            <span className="serif-accent text-white/50">por fecha de primera vista (UTC).</span>
          </h2>
          <p className="mt-2 text-[12px] text-white/35">
            Volumen: ventana en días UTC (mín. {VOLUME_WINDOW_MIN_DAYS}, hasta {VOLUME_WINDOW_CAP_DAYS} si los eventos lo requieren). Elige vista abajo si el área día a día es difícil de leer.
          </p>
          <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
            {loading
              ? 'Cargando eventos…'
              : totalEvents === 0
              ? 'Aún no hay eventos desde `/api/events`. Si el backend está vacío, estos gráficos se quedarán sin serie.'
              : `${totalEvents} eventos en total · ${totalCritical} críticos.`}
          </p>
        </div>

        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.07] self-start">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                active === tab.id ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/55'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {active === 'volume' && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 shrink-0">
              Vista volumen
            </span>
            <div className="flex gap-1 flex-wrap">
              {VOLUME_VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.hint}
                  onClick={() => setVolumeView(v.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border border-transparent ${
                    volumeView === v.id
                      ? 'bg-white/10 text-white border-white/[0.12]'
                      : 'text-white/40 hover:text-white/65 hover:bg-white/[0.04]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

      <div className="h-64 w-full min-h-[16rem]">
        {active === 'volume' && volumeView === 'area_daily' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyBuckets} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={dailyBuckets.length > 40 ? Math.max(7, Math.floor(dailyBuckets.length / 14)) : 7}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, volumeYMax]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="total" name="Eventos" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} fill="url(#volGrad)" dot={false} isAnimationActive />
              <Area type="monotone" dataKey="critical" name="Críticos" stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="3 3" fill="transparent" dot={false} isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {active === 'volume' && volumeView === 'bars_daily' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStacked} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={dailyBuckets.length > 48 ? Math.max(6, Math.floor(dailyBuckets.length / 14)) : 4}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, volumeYMax]}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.5)' }}>{value}</span>}
              />
              <Bar
                stackId="vol"
                dataKey="otros"
                name="No críticos"
                fill="rgba(255,255,255,0.32)"
                radius={[0, 0, 0, 0]}
                isAnimationActive
              />
              <Bar stackId="vol" dataKey="critical" name="Críticos" fill="rgba(226, 106, 90, 0.75)" radius={[2, 2, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        )}

        {active === 'volume' && volumeView === 'bars_weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStacked} margin={{ top: 4, right: 8, left: -20, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                angle={weeklyStacked.length > 8 ? -28 : 0}
                textAnchor={weeklyStacked.length > 8 ? 'end' : 'middle'}
                height={weeklyStacked.length > 8 ? 54 : 32}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, volumeYMax]}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.5)' }}>{value}</span>}
              />
              <Bar stackId="w" dataKey="otros" name="No críticos" fill="rgba(255,255,255,0.32)" isAnimationActive />
              <Bar stackId="w" dataKey="critical" name="Críticos" fill="rgba(226, 106, 90, 0.75)" radius={[3, 3, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        )}

        {active === 'severity' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severities} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, severityYMax]}
              />
              <Tooltip content={<SeverityTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Eventos" radius={[3, 3, 0, 0]} isAnimationActive>
                {severities.map((_, i) => (
                  <Cell key={i} fill={PIE_WHITES[i % PIE_WHITES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {active === 'institutions' && (
          <div className="flex flex-col md:flex-row items-stretch gap-10 h-full">
            {institutions.length === 0 ? (
              <div className="flex items-center justify-center w-full text-[13px] text-white/35">
                Sin datos de instituciones todavía.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="40%" height="100%">
                  <PieChart>
                    <Pie data={institutions} cx="50%" cy="50%" innerRadius="52%" outerRadius="80%" dataKey="calls" isAnimationActive>
                      {institutions.map((_, i) => (
                        <Cell key={i} fill={PIE_WHITES[i % PIE_WHITES.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload as { name: string; calls: number }
                        return (
                          <div className="glass glass-inner rounded-xl px-3 py-2 text-[12px]">
                            <p className="text-white/50 font-mono text-[11px]">{d.name}</p>
                            <p className="text-white/85 font-medium">{d.calls} eventos</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center gap-3 flex-1">
                  {institutions.map((e, i) => (
                    <div key={e.name} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PIE_WHITES[i] }} />
                      <span className="text-[12px] text-white/55 flex-1 truncate">{e.name}</span>
                      <span className="text-[12px] text-white/75 font-medium">{e.calls}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </motion.section>
  )
}
