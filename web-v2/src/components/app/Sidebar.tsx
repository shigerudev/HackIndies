import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Github } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import type { Role } from '@/lib/roles-meta'
import { ROLE_META } from '@/lib/roles-meta'

type Props = { role: Role }

export function Sidebar({ role }: Props) {
  return (
    <aside className="app-sidebar">
      <Link href="/" className="app-sidebar__brand">
        <Image src="/logo-horizontal.png" alt="NOMAD Centinela" width={140} height={24} style={{ height: 'auto' }} />
      </Link>

      <nav className="app-sidebar__nav" aria-label="Navegación principal">
        <div className="app-sidebar__section">
          <SidebarNav role={role} />
        </div>
      </nav>

      <div className="app-sidebar__footer">
        <Link href="/" className="app-sidebar__item">
          <ExternalLink size={14} />
          Landing pública
        </Link>
        <a
          href="https://github.com/shigerudev/HackIndies"
          target="_blank"
          rel="noopener noreferrer"
          className="app-sidebar__item"
        >
          <Github size={14} />
          GitHub
        </a>
      </div>
    </aside>
  )
}