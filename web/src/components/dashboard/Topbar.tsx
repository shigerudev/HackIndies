'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShieldAlert, Inbox, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useHealth } from '@/hooks/useHealth'
import { useEvents } from '@/hooks/useEvents'
import { cn } from '@/lib/utils'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'baja', medium: 'media', high: 'alta', critical: 'crítica',
}

function formatRelativeEs(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} m`
  if (diff < 86_400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86_400)} d`
}

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false)
  const { online, health, loading: healthLoading } = useHealth()
  const { events: pending } = useEvents({ status: 'pending_review', pollMs: 30_000 })

  const apiState =
    healthLoading && online === null ? 'loading'
    : online === false ? 'offline'
    : 'online'

  const apiLabel =
    apiState === 'loading' ? 'Conectando…'
    : apiState === 'offline' ? 'API offline'
    : 'API online'

  const pendingCount = pending.length

  return (
    <header className="h-[60px] border-b border-white/[0.06] flex items-center px-6 gap-3 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
      <div className="flex-1" />

      {/* Real API health pill, driven by /api/health */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl glass shrink-0',
          apiState === 'offline' && 'opacity-70'
        )}
        title={health ? `Supabase: ${health.supabase ? 'on' : 'off'} · MiniMax: ${health.minimax ? 'on' : 'off'}` : 'Sin respuesta'}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            apiState === 'online' ? 'bg-white/55 pulse-dot'
              : apiState === 'loading' ? 'bg-white/22 pulse-dot'
              : 'bg-white/18'
          )}
        />
        <span className="text-[11px] font-medium text-white/55 whitespace-nowrap">
          {apiLabel}
        </span>
      </div>

      {/* Notifications: real pending events */}
      <div className="relative shrink-0">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className={cn(
            'relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors',
            notifOpen && 'bg-white/[0.06]'
          )}
          aria-label="Notificaciones"
        >
          <Bell size={14} className="text-white/45" strokeWidth={1.5} />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setNotifOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 32 }}
                className="absolute right-0 top-11 rounded-2xl glass glass-inner shadow-2xl z-50 overflow-hidden"
                style={{ width: 320 }}
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-white/65 tracking-tight">
                    Esperando revisión
                  </p>
                  <span className="text-[10px] font-mono text-white/30">{pendingCount}</span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {pendingCount === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 px-6 text-center">
                      <Inbox size={16} className="text-white/25" strokeWidth={1.5} />
                      <p className="text-[12px] text-white/45">Bandeja vacía</p>
                      <p className="text-[10.5px] text-white/30 leading-snug">
                        No hay eventos esperando aprobación humana.
                      </p>
                    </div>
                  ) : (
                    pending.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors border-b border-white/[0.04] last:border-0"
                      >
                        <ShieldAlert size={13} className="text-white/55 mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-white/80 leading-snug font-medium truncate">
                            {event.title}
                          </p>
                          <p className="text-[10.5px] text-white/35 mt-0.5 truncate">
                            {event.institution_name} · severidad {SEVERITY_LABEL[event.severity] ?? event.severity}
                          </p>
                          <p className="text-[9.5px] text-white/25 mt-1 font-mono">
                            {formatRelativeEs(event.first_seen_at)}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <Link
                  href="#logs"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors text-[11px] font-medium text-white/55"
                >
                  <BookOpen size={11} strokeWidth={1.5} />
                  Ver historial completo
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Brand avatar (no fake hover menu) */}
      <div
        className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/[0.12] flex items-center justify-center text-[11px] font-semibold text-white/60 shrink-0"
        title="NOMAD security"
      >
        N
      </div>
    </header>
  )
}
