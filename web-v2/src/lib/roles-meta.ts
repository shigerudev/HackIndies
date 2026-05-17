export type Role = 'defensor' | 'revisor' | 'periodista' | 'ciudadano';

const VALID_ROLES: Role[] = ['defensor', 'revisor', 'periodista', 'ciudadano'];

export const ROLE_META: Record<Role, { label: string; desc: string; defaultRoute: string }> = {
  defensor: {
    label: 'Defensor',
    desc: 'SOC institucional, equipo de seguridad',
    defaultRoute: '/app/eventos',
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