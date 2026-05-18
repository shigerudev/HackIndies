'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Play, Shield, ListChecks, MessageCircle, BookOpen } from 'lucide-react'
import type { Role } from '@/lib/roles-meta'
import { useEvents } from '@/hooks/useEvents'

const ROLE_LABELS: Record<Role, string> = {
  defensor: 'Defensor',
  revisor: 'Revisor',
  periodista: 'Periodista',
  ciudadano: 'Ciudadano',
}

const ALL_NAV_ITEMS = [
  { href: '/app/dashboard', label: 'Resumen',         icon: <LayoutGrid    size={16} /> },
  { href: '/app/pipeline',  label: 'Pipeline',        icon: <Play          size={16} /> },
  { href: '/app/eventos',   label: 'Eventos',         icon: <Shield        size={16} /> },
  { href: '/app/hitl',      label: 'HITL',            icon: <ListChecks    size={16} /> },
  { href: '/app/citizen',   label: 'Ciudadano',       icon: <MessageCircle size={16} /> },
  { href: '/casos',         label: 'Casos públicos',  icon: <BookOpen      size={16} /> },
  { href: '/app/playground',label: 'API Playground',  icon: <ListChecks    size={16} /> },
]

function HitlBadge() {
  const { events } = useEvents({ status: 'pending_review', pollMs: 60_000 })
  const count = events.length
  if (count === 0) return null
  return <span className={`badge ${count > 0 ? 'crit' : ''}`}>{count}</span>
}

type Props = { role: Role }

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()

  return (
    <>
      <div className="app-sidebar__section-label">{ROLE_LABELS[role]}</div>
      {ALL_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-sidebar__item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
            {item.href === '/app/hitl' && <HitlBadge />}
          </Link>
        )
      })}
    </>
  )
}