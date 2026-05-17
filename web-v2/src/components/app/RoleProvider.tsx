'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/role';

type Props = {
  initialRole: Role;
  children: ReactNode;
};

type ContextValue = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleContext = createContext<ContextValue | null>(null);

export function RoleProvider({ initialRole, children }: Props) {
  const [role, setRoleState] = useState<Role>(initialRole);
  const router = useRouter();

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    // Persist in localStorage for client-side memory
    if (typeof window !== 'undefined') {
      localStorage.setItem('nomad_role', r);
    }
    // Server will read from cookie; trigger navigation to update server layout
    router.push('/app');
    router.refresh();
  }, [router]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): ContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}