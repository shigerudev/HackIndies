'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { useEvents } from '@/hooks/useEvents'
import { cn } from '@/lib/utils'
import type { ExposureEvent } from '@/services/api/client'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
}
const STATUS_LABEL: Record<string, string> = {
  pending_review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  published: 'Publicado',
}

const STATUS_TABS = [
  { id: 'all',            label: 'Todos' },
  { id: 'pending_review', label: 'Pendientes' },
  { id: 'published',      label: 'Publicados' },
] as const
type StatusFilter = typeof STATUS_TABS[number]['id']

function formatDateEs(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function RecentLogs() {
  const { events, loading } = useEvents({ pollMs: 30_000 })
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const PER_PAGE = 8

  const filtered = useMemo(() => {
    const arr = filter === 'all' ? events : events.filter((e) => e.status === filter)
    return [...arr].sort(
      (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
    )
  }, [events, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <motion.section
      id="logs"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
        <div className="max-w-xl">
          <p className="eyebrow">Historial</p>
          <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
            Todos tus eventos{' '}
            <span className="serif-accent text-white/50">en un solo lugar.</span>
          </h2>
          <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
            Filtra por estado y abre cualquier evento para ver el detalle, las trazas de los
            agentes y las decisiones humanas.
          </p>
        </div>

        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.07] self-start">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setPage(0) }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all',
                filter === tab.id ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/55'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card rounded-2xl overflow-x-auto">
        <div className="grid grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.7fr] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.06] min-w-[640px]">
          {['Evento', 'Institución', 'Severidad', 'Estado', 'Detectado'].map((h) => (
            <span key={h} className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/25">
              {h}
            </span>
          ))}
        </div>

        {loading && events.length === 0 ? (
          <div className="flex flex-col gap-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-lg" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={20} className="text-white/25" strokeWidth={1.5} />
            <p className="text-[13px] text-white/45">No hay eventos en este filtro</p>
          </div>
        ) : (
          paginated.map((event: ExposureEvent, i: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.025 }}
              className="grid grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.7fr] gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0 group min-w-[640px]"
            >
              <Link
                href={`/events/${event.id}`}
                className="text-[12.5px] text-white/80 font-medium truncate self-center group-hover:text-white"
              >
                {event.title}
              </Link>
              <span className="text-[11.5px] text-white/45 self-center truncate">
                {event.institution_name}
              </span>
              <span className="flex items-center gap-2 self-center">
                <span className={cn(
                  'dot',
                  event.severity === 'critical' ? 'dot-critical'
                    : event.severity === 'high'  ? 'dot-high'
                    : event.severity === 'medium' ? 'dot-medium'
                    : 'dot-low'
                )} />
                <span className="text-[11px] text-white/65">
                  {SEVERITY_LABEL[event.severity] ?? event.severity}
                </span>
              </span>
              <span
                className={cn(
                  'pill-status self-center w-fit',
                  event.status === 'pending_review' && 'pill-status-pending',
                  event.status === 'approved'       && 'pill-status-approved',
                  event.status === 'published'      && 'pill-status-published',
                  event.status === 'rejected'       && 'pill-status-rejected'
                )}
              >
                {STATUS_LABEL[event.status] ?? event.status}
              </span>
              <span className="text-[10.5px] text-white/30 self-center">
                {formatDateEs(event.first_seen_at)}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-[11px] text-white/28">
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-[11px] text-white/40 border border-white/[0.07] hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-[11px] text-white/40 border border-white/[0.07] hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </motion.section>
  )
}
