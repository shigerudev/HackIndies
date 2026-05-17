'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Terminal,
  ShieldCheck,
  BookOpen,
  Activity,
  HeartPulse,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useHealth } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'

interface NavItem {
  hash: string
  label: string
  icon: typeof LayoutDashboard
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { hash: '#top',            label: 'Inicio',          icon: LayoutDashboard, group: 'Visión general' },
  { hash: '#insights',       label: 'Insights',        icon: Sparkles,        group: 'Visión general' },
  { hash: '#analytics',      label: 'Analíticas',      icon: BarChart3,       group: 'Visión general' },
  { hash: '#playground',     label: 'Agentes IA',      icon: Terminal,        group: 'Herramientas' },
  { hash: '#citizen-check',  label: '¿Estás expuesto?', icon: ShieldCheck,    group: 'Herramientas' },
  { hash: '#playbooks',      label: 'Playbooks',       icon: BookOpen,        group: 'Herramientas' },
  { hash: '#activity',       label: 'Actividad',       icon: Activity,        group: 'Operaciones' },
  { hash: '#system-health',  label: 'Estado',          icon: HeartPulse,      group: 'Operaciones' },
  { hash: '#logs',           label: 'Historial',       icon: FileText,        group: 'Operaciones' },
]

const GROUPS = ['Visión general', 'Herramientas', 'Operaciones'] as const

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeHash, setActiveHash] = useState<string>('#top')
  const { online } = useHealth()

  useEffect(() => {
    const onScroll = () => {
      // Find closest section to viewport top
      let best = '#top'
      let bestDist = Infinity
      NAV_ITEMS.forEach((item) => {
        const id = item.hash.slice(1)
        const el = id === 'top' ? document.body : document.getElementById(id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top - 80)
        if (rect.top < 200 && dist < bestDist) {
          bestDist = dist
          best = item.hash
        }
      })
      setActiveHash(best)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ type: 'spring' as const, stiffness: 320, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#0d0d0d] border-r border-white/[0.06] shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <Link
        href="/"
        className={cn(
          'flex items-center gap-3 px-4 h-[60px] border-b border-white/[0.06] shrink-0 hover:bg-white/[0.02] transition-colors',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (
          <div className="w-8 h-8 shrink-0 flex items-center justify-center" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="8" r="3.5" fill="white" fillOpacity="0.8" />
              <circle cx="16" cy="8" r="3.5" fill="white" fillOpacity="0.8" />
              <circle cx="8" cy="16" r="3.5" fill="white" fillOpacity="0.8" />
              <circle cx="16" cy="16" r="3.5" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
        ) : (
          <Image
            src="/logo-horizontal.png"
            alt="NOMAD Centinela — inicio"
            width={200}
            height={50}
            className="h-7 w-auto max-w-[158px] object-contain object-left shrink-0"
            priority
          />
        )}
      </Link>

      {/* Live status pill */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-4 mb-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                online === false ? 'bg-white/20' : 'bg-white/55 pulse-dot'
              )} />
              <span className="text-[11px] font-medium text-white/50">
                {online === null ? 'Conectando…' : online ? 'Servicios operativos' : 'Backend offline'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav grouped */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {GROUPS.map((group, gi) => (
          <div key={group} className={cn(gi > 0 && 'mt-5')}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-white/25 px-3 mb-1.5"
                >
                  {group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map(({ hash, label, icon: Icon }) => {
                const active = activeHash === hash
                return (
                  <a key={hash} href={hash} className="block relative">
                    <motion.div
                      whileHover={{ x: collapsed ? 0 : 2 }}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-colors duration-150',
                        active
                          ? 'bg-white/[0.07] text-white border border-white/[0.1]'
                          : 'text-white/40 hover:text-white/75 hover:bg-white/[0.03] border border-transparent'
                      )}
                    >
                      <Icon size={14} className="shrink-0" strokeWidth={active ? 2 : 1.5} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.12 }}
                            className="whitespace-nowrap"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-r-full"
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                      />
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0">
                N
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/65 truncate">NOMAD Centinela</p>
                <p className="text-[10px] text-white/30 truncate">Apache 2.0 · Def/Acc</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl hover:bg-white/[0.04] text-white/30 hover:text-white/60 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  )
}
