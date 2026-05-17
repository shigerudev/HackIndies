'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Play, Shield, ListChecks, MessageCircle } from 'lucide-react'
import type { Role } from '@/lib/roles-meta'
import { useEvents } from '@/hooks/useEvents'

const NAV_BY_ROLE: Record<Role, { label: string; items: { href: string; label: string; icon: React.ReactNode }[] }> = {
  defensor: {
    label: 'Defensor',
    items: [
      { href: '/app/dashboard', label: 'Resumen',      icon: <LayoutGrid size={16} /> },
      { href: '/app/pipeline',   label: 'Pipeline',    icon: <Play      size={16} /> },
      { href: '/app/eventos',    label: 'Eventos',     icon: <Shield    size={16} /> },
      { href: '/app/hitl',       label: 'HITL',        icon: <ListChecks size={16} /> },
      { href: '/app/citizen',    label: 'Ciudadano',   icon: <MessageCircle size={16} /> },
    ],
  },
  revisor: {
    label: 'Revisor',
    items: [
      { href: '/app/hitl',       label: 'HITL',        icon: <ListChecks size={16} /> },
      { href: '/app/eventos',    label: 'Eventos',     icon: <Shield    size={16} /> },
      { href: '/casos',          label: 'Casos',       icon: <LayoutGrid size={16} /> },
      { href: '/app/pipeline',   label: 'Pipeline',   icon: <Play      size={16} /> },
    ],
  },
  periodista: {
    label: 'Periodista',
    items: [
      { href: '/casos',          label: 'Casos',       icon: <LayoutGrid size={16} /> },
      { href: '/app/eventos',    label: 'Eventos publicados', icon: <Shield size={16} /> },
      { href: '/app/playground', label: 'API playground', icon: <ListChecks size={16} /> },
    ],
  },
  ciudadano: {
    label: 'Ciudadano',
    items: [
      { href: '/app/citizen', label: 'Verificar correo', icon: <MessageCircle size={16} /> },
    ],
  },
}

function HitlBadge() {
  const { events } = useEvents({ status: 'pending_review', pollMs: 60_000 })
  const count = events.length
  if (count === 0) return null
  return <span className={`badge ${count > 0 ? 'crit' : ''}`}>{count}</span>
}

type Props = { role: Role }

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()
  const { items } = NAV_BY_ROLE[role]

  return (
    <>
      <div className="app-sidebar__section-label">{NAV_BY_ROLE[role].label}</div>
      {items.map((item) => {
        const isActive = pathname === item.href
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