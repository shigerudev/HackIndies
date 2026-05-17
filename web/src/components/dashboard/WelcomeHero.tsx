'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Plug, BarChart3, ShieldCheck, ArrowRight, MessageCircle, Building2 } from 'lucide-react'
import { useHealth } from '@/hooks/useHealth'
import { useInstitutions } from '@/hooks/useInstitutions'
import { useEvents } from '@/hooks/useEvents'
import { StatusPill } from './primitives/StatusPill'
import { Disclosure } from './primitives/Disclosure'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
}

function buildStatusMessage(
  apiOnline: boolean | null,
  pendingCount: number
): { state: 'online' | 'degraded' | 'offline' | 'loading'; label: string } {
  if (apiOnline === null) return { state: 'loading', label: 'Conectando con el backend…' }
  if (!apiOnline)
    return {
      state: 'offline',
      label: 'Sin conexión al backend (`NEXT_PUBLIC_API_URL`)',
    }
  if (pendingCount === 0) return { state: 'online', label: 'Todo en orden · sin pendientes' }
  if (pendingCount === 1) return { state: 'degraded', label: '1 alerta esperando revisión' }
  return { state: 'degraded', label: `${pendingCount} alertas esperando revisión` }
}

export default function WelcomeHero() {
  const { health, online } = useHealth()
  const { institutions, loading: instLoading } = useInstitutions()
  const { events: pending } = useEvents({ status: 'pending_review', pollMs: 30_000 })

  const institutionCount = instLoading ? null : institutions.length
  const pendingCount = pending.length
  const status = buildStatusMessage(online, pendingCount)

  return (
    <motion.section
      id="top"
      variants={container}
      initial="hidden"
      animate="show"
      className="relative section-pad border-b border-white/[0.06] overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-white/[0.015] blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl">
        {/* Status pill */}
        <motion.div variants={item} className="mb-10">
          <StatusPill state={status.state} label={status.label} />
        </motion.div>

        {/* Single, calmer headline */}
        <motion.div variants={item} className="mb-5">
          <h1 className="text-[40px] md:text-[48px] font-semibold tracking-tight text-white leading-[1.05]">
            Tu plataforma NOMAD está{' '}
            <span className="serif-accent text-white/55">
              {online === false ? 'desconectada del API.' : 'lista.'}
            </span>
          </h1>
        </motion.div>

        <motion.div variants={item} className="mb-12 max-w-xl">
          <p className="text-[15px] text-white/50 leading-relaxed">
            Detecta exposición de credenciales antes de que se vuelva una brecha.
            {institutionCount !== null && (
              <>
                {' '}
                Catálogo activo en el API:{' '}
                <span className="text-white/80 font-medium">
                  {institutionCount} {institutionCount === 1 ? 'institución' : 'instituciones'}
                </span>
                .
              </>
            )}
          </p>
        </motion.div>

        {/* Primary CTA inline (denser, less imposing) + 3 quick actions row */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-3 mb-10">
          <Link
            href="#playground"
            className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-[13px] font-semibold transition-colors hover:bg-white/92"
          >
            <Play size={11} strokeWidth={2.2} fill="currentColor" />
            Consola de agentes
            <ArrowRight
              size={12}
              strokeWidth={2}
              className="ml-0.5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          {[
            { icon: Building2, label: 'Organizaciones', href: '#organizaciones' },
            { icon: ShieldCheck, label: '¿Estás expuesto?', href: '#citizen-check' },
            { icon: BarChart3, label: 'Ver analíticas', href: '#analytics' },
            { icon: MessageCircle, label: 'Asistente', href: '#citizen-assistant' },
            { icon: Plug, label: 'Cómo funciona', href: '#how-it-works' },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.035] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.12] text-[12.5px] font-medium text-white/75 hover:text-white/95 transition-colors"
            >
              <Icon size={12} strokeWidth={1.6} />
              {label}
            </Link>
          ))}
        </motion.div>

        {/* Tech detail — hidden by default */}
        <motion.div variants={item}>
          <Disclosure label="Ver detalles técnicos del sistema">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-4 pt-2">
              {[
                { label: 'Instituciones',     value: institutionCount === null ? '…' : String(institutionCount) },
                { label: 'Revisiones HITL',   value: String(pendingCount) },
                { label: 'Supabase',          value: health ? (health.supabase ? 'Online' : 'Offline') : '…' },
                { label: 'Modelo IA',         value: health ? (health.minimax ? 'MiniMax' : 'Mock') : '…' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/25">
                    {s.label}
                  </span>
                  <span className="text-[15px] font-mono font-semibold text-white/85">{s.value}</span>
                </div>
              ))}
            </div>
          </Disclosure>
        </motion.div>
      </div>
    </motion.section>
  )
}
