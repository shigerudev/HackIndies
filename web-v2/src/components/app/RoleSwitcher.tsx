'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ROLE_META, type Role } from '@/lib/roles-meta';
import { cn } from '@/lib/cn';

const ROLES = Object.keys(ROLE_META) as Role[];

type Props = {
  currentRole: Role;
};

export function RoleSwitcher({ currentRole }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="role-switch">
      <button
        type="button"
        className="role-switch__trigger"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {ROLE_META[currentRole].label}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="role-switch__menu open" role="listbox" aria-label="Cambiar rol">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="option"
              aria-selected={r === currentRole}
              className={cn('role-switch__option', r === currentRole && 'selected')}
              onClick={() => {
                localStorage.setItem('nomad_role', r);
                setOpen(false);
                // Use the ?as= role override
                window.location.href = `/app/api/role/set?role=${r}`;
              }}
            >
              <div>
                <div className="opt-name">{ROLE_META[r].label}</div>
                <div className="opt-desc">{ROLE_META[r].desc}</div>
              </div>
              {r === currentRole && <Check size={14} style={{ color: 'var(--brand-cyan)', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}