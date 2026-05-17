import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  ListChecks,
  BookOpen,
  Building2,
  LayoutGrid,
  MessageCircle,
  ExternalLink,
  Github,
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import type { Role } from '@/lib/roles-meta';
import { ROLE_META } from '@/lib/roles-meta';

type NavItem = { href: string; label: string; icon: ReactNode; badge?: string };

const NAV_BY_ROLE: Record<Role, { label: string; items: NavItem[] }> = {
  defensor: {
    label: 'Defensor',
    items: [
      { href: '/app/dashboard', label: 'Inicio', icon: <LayoutGrid size={16} /> },
      { href: '/app/eventos', label: 'Eventos', icon: <Shield size={16} /> },
      { href: '/app/hitl', label: 'HITL', icon: <ListChecks size={16} />, badge: '5' },
      { href: '/app/playbooks', label: 'Playbooks', icon: <BookOpen size={16} /> },
      { href: '/app/instituciones', label: 'Instituciones', icon: <Building2 size={16} /> },
      { href: '/app/casos', label: 'Casos', icon: <LayoutGrid size={16} /> },
      { href: '/app/citizen', label: 'Ciudadano', icon: <MessageCircle size={16} /> },
    ],
  },
  revisor: {
    label: 'Revisor',
    items: [
      { href: '/app/hitl', label: 'HITL', icon: <ListChecks size={16} />, badge: '5' },
      { href: '/app/eventos', label: 'Eventos', icon: <Shield size={16} /> },
      { href: '/app/casos', label: 'Casos', icon: <LayoutGrid size={16} /> },
    ],
  },
  periodista: {
    label: 'Periodista',
    items: [
      { href: '/app/casos', label: 'Casos', icon: <LayoutGrid size={16} /> },
      { href: '/app/eventos', label: 'Eventos publicados', icon: <Shield size={16} /> },
      { href: '/app/playground', label: 'API playground', icon: <BookOpen size={16} /> },
    ],
  },
  ciudadano: {
    label: 'Ciudadano',
    items: [
      { href: '/app/citizen', label: 'Verificar correo', icon: <MessageCircle size={16} /> },
    ],
  },
};

type Props = { role: Role };

export function Sidebar({ role }: Props) {
  const { items } = NAV_BY_ROLE[role];

  return (
    <aside className="app-sidebar">
      <Link href="/" className="app-sidebar__brand">
        <Image src="/logo-horizontal.png" alt="NOMAD Centinela" width={140} height={24} style={{ height: 'auto' }} />
      </Link>

      <nav className="app-sidebar__nav" aria-label="Navegación principal">
        <div className="app-sidebar__section">
          <div className="app-sidebar__section-label">{ROLE_META[role].label}</div>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-sidebar__item ${item.href === '/app/eventos' && role === 'defensor' ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.badge && <span className={`badge ${item.badge === '5' ? 'crit' : ''}`}>{item.badge}</span>}
            </Link>
          ))}
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
  );
}