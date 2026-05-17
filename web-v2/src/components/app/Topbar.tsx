import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import type { Role } from '@/lib/roles-meta';
import { ROLE_META } from '@/lib/roles-meta';

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  role: Role;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
};

export function Topbar({ role, breadcrumbs = [], actions }: Props) {
  return (
    <div className="app-topbar">
      <div className="app-topbar__crumbs">
        <Link href="/">NOMAD</Link>
        <span className="sep"><ChevronRight size={10} /></span>
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {crumb.href ? (
              <>
                <Link href={crumb.href}>{crumb.label}</Link>
                <span className="sep"><ChevronRight size={10} /></span>
              </>
            ) : (
              <span className="current">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="app-topbar__actions">
        <RoleSwitcher currentRole={role} />
        {actions}
      </div>
    </div>
  );
}