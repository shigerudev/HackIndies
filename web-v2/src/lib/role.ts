import { cookies } from 'next/headers';

export type Role = 'defensor' | 'revisor' | 'periodista' | 'ciudadano';

const COOKIE_NAME = 'nomad_role';
const VALID_ROLES: Role[] = ['defensor', 'revisor', 'periodista', 'ciudadano'];

export const ROLE_META: Record<Role, { label: string; desc: string; defaultRoute: string }> = {
  defensor: {
    label: 'Defensor',
    desc: 'SOC institucional, equipo de seguridad',
    defaultRoute: '/app/dashboard',
  },
  revisor: {
    label: 'Revisor HITL',
    desc: 'Editor responsable, lead técnico',
    defaultRoute: '/app/hitl',
  },
  periodista: {
    label: 'Periodista',
    desc: 'Medios independientes, investigación',
    defaultRoute: '/app/casos',
  },
  ciudadano: {
    label: 'Ciudadano',
    desc: 'Empleado público, verificación personal',
    defaultRoute: '/app/citizen',
  },
};

export function isValidRole(r: string): r is Role {
  return VALID_ROLES.includes(r as Role);
}

export async function getRole(): Promise<Role> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value ?? '';
  return isValidRole(raw) ? raw as Role : 'defensor';
}

export async function setRoleCookie(role: Role): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,
    sameSite: 'lax',
  });
}

export { COOKIE_NAME };