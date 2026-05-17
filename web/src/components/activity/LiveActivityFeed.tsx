'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { cn } from '@/lib/utils'
import type { ExposureEvent } from '@/services/api/client'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'baja', medium: 'media', high: 'alta', critical: 'crítica',
}

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  published: 'Publicado',
}

function formatRelativeEs(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86_400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86_400)} d`
}

function institutionInitials(name: string): string {
  return name
    .replace(/[—–-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function EventRow({ event, fresh }: { event: ExposureEvent; fresh: boolean }) {
  return (
    <motion.div
      layout
      initial={fresh ? { opacity: 0, x: -10, height: 0 } : false}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 32 }}
      className="group flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
    >
      {/* Institution badge */}
      <div className="relative shrink-0">
        <div className="icon-wrap-sm font-mono text-[10.5px] font-semibold tracking-tight text-white/70">
          {institutionInitials(event.institution_name)}
        </div>
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 dot dot-lg border-2 border-[#0a0a0a]',
            event.severity === 'critical' ? 'dot-critical pulse-dot'
              : event.severity === 'high'  ? 'dot-high'
              : event.severity === 'medium' ? 'dot-medium'
              : 'dot-low'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] text-white/85 font-medium truncate">{event.title}</p>
        <p className="text-[10.5px] text-white/35 mt-0.5 truncate">
          {event.institution_name} · severidad {SEVERITY_LABEL[event.severity] ?? event.severity}
        </p>
      </div>

      <span
        className={cn(
          'pill-status shrink-0 hidden md:inline-flex',
          event.status === 'pending_review' && 'pill-status-pending',
          event.status === 'approved'       && 'pill-status-approved',
          event.status === 'published'      && 'pill-status-published',
          event.status === 'rejected'       && 'pill-status-rejected'
        )}
      >
        {STATUS_LABEL[event.status] ?? event.status}
      </span>

      <span className="text-[10.5px] text-white/30 w-14 text-right shrink-0 font-mono">
        {formatRelativeEs(event.first_seen_at)}
      </span>
    </motion.div>
  )
}

export default function LiveActivityFeed() {
  const { events, isMock, loading, error } = useEvents({ pollMs: 12_000 })
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!events.length) return
    setSeenIds((prev) => {
      const next = new Set(prev)
      events.forEach((e) => next.add(e.id))
      return next
    })
  }, [events])

  const sorted = [...events]
    .sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime())
    .slice(0, 14)

  return (
    <motion.section
      id="activity"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="flex items-end justify-between mb-10">
        <div className="max-w-xl">
          <p className="eyebrow">Actividad reciente</p>
          <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
            Lo que está pasando{' '}
            <span className="serif-accent text-white/50">ahora.</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            error ? 'bg-white/15' : isMock ? 'bg-white/30' : 'bg-white/55 pulse-dot'
          )} />
          <span className="text-[11px] text-white/40">
            {error ? 'sin conexión' : isMock ? 'respuesta mock' : 'en vivo'}
          </span>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-lg" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Activity size={20} className="text-white/25" strokeWidth={1.5} />
            <p className="text-[13px] text-white/45">Sin actividad reciente</p>
            <p className="text-[11px] text-white/30 text-center max-w-xs">
              Cuando lleguen eventos del backend aparecerán aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {sorted.map((event) => (
                <EventRow key={event.id} event={event} fresh={!seenIds.has(event.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  )
}
