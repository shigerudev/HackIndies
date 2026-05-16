/**
 * Datos sintéticos embebidos — fallback cuando Supabase no está configurado.
 * Debe mantenerse alineado con supabase/seed.sql
 */
import type {
  ExposureEvent,
  ExposureEventDetail,
  Institution,
  Playbook,
} from '../../../shared/types/api.js';

export const MOCK_INSTITUTIONS: Institution[] = [
  { id: 'b1000000-0000-4000-8000-000000000001', slug: 'digecam', name: 'DIGECAM', sector: 'defensa', country: 'GT', domain_obfuscated: 'digecam[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000002', slug: 'mintrab-tu-empleo', name: 'MINTRAB — Portal Tu Empleo', sector: 'trabajo', country: 'GT', domain_obfuscated: 'tuempleo[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000003', slug: 'mspas', name: 'MSPAS — Ministerio de Salud', sector: 'salud', country: 'GT', domain_obfuscated: 'mspas[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000004', slug: 'mineduc', name: 'MINEDUC', sector: 'educacion', country: 'GT', domain_obfuscated: 'mineduc[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000005', slug: 'renap', name: 'RENAP', sector: 'identidad', country: 'GT', domain_obfuscated: 'renap[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000006', slug: 'sat', name: 'SAT', sector: 'fiscal', country: 'GT', domain_obfuscated: 'sat[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000007', slug: 'pgn', name: 'Procuraduría General de la Nación', sector: 'justicia', country: 'GT', domain_obfuscated: 'pgn[.]gob[.]gt' },
  { id: 'b1000000-0000-4000-8000-000000000008', slug: 'covial', name: 'COVIAL', sector: 'transporte', country: 'GT', domain_obfuscated: 'covial[.]gob[.]gt' },
];

export const MOCK_EVENTS: ExposureEvent[] = [
  { id: 'e1000000-0000-4000-8000-000000000001', title: 'Exposición previa detectada en inteligencia', summary: 'Señales meses antes del incidente.', severity: 'critical', status: 'published', institution_slug: 'digecam', institution_name: 'DIGECAM', actor_name: 'GordonFreeman', credentials_count: 21700, first_seen_at: '2025-06-15T08:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000002', title: 'Incidente confirmado — registro de armas', summary: 'Brecha confirmada por la institución.', severity: 'critical', status: 'published', institution_slug: 'digecam', institution_name: 'DIGECAM', actor_name: 'GordonFreeman', credentials_count: 21700, first_seen_at: '2026-04-09T14:30:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000003', title: 'Portal Tu Empleo — exfiltración masiva', summary: 'API sin controles de acceso.', severity: 'critical', status: 'published', institution_slug: 'mintrab-tu-empleo', institution_name: 'MINTRAB — Portal Tu Empleo', actor_name: 'GordonFreeman', credentials_count: 200000, first_seen_at: '2026-04-26T10:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000004', title: 'MSPAS — ransomware en sistemas', summary: 'Encriptación de archivos.', severity: 'high', status: 'published', institution_slug: 'mspas', institution_name: 'MSPAS — Ministerio de Salud', actor_name: 'Dianna', credentials_count: 0, first_seen_at: '2026-04-13T09:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000005', title: 'MINEDUC — acceso no autorizado', summary: 'Evidencia en revisión.', severity: 'high', status: 'published', institution_slug: 'mineduc', institution_name: 'MINEDUC', actor_name: 'GordonFreeman', credentials_count: 5000, first_seen_at: '2026-04-30T16:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000006', title: 'RENAP — credenciales en mercado clandestino', summary: 'Lote ofrecido; institución negó brecha.', severity: 'high', status: 'pending_review', institution_slug: 'renap', institution_name: 'RENAP', actor_name: 'Team L4TAMFUCKERS', credentials_count: 40300, first_seen_at: '2025-08-01T00:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000007', title: 'SAT — superficie de riesgo acumulada', summary: 'Usuarios en registros de inteligencia.', severity: 'critical', status: 'pending_review', institution_slug: 'sat', institution_name: 'SAT', actor_name: 'Unknown Stealer Botnet', credentials_count: 258000, first_seen_at: '2025-07-20T00:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000008', title: 'PGN — intento de acceso reportado', summary: 'Negado por institución.', severity: 'medium', status: 'approved', institution_slug: 'pgn', institution_name: 'Procuraduría General de la Nación', actor_name: null, credentials_count: 120, first_seen_at: '2026-04-28T11:00:00Z' },
  { id: 'e1000000-0000-4000-8000-000000000009', title: 'COVIAL — mejora post-crisis', summary: 'CSP implementado.', severity: 'low', status: 'published', institution_slug: 'covial', institution_name: 'COVIAL', actor_name: null, credentials_count: 0, first_seen_at: '2026-05-01T00:00:00Z' },
];

const MOCK_EVENT_DETAILS: Record<string, ExposureEventDetail> = {
  'e1000000-0000-4000-8000-000000000002': {
    ...MOCK_EVENTS[0],
    payload: { records_weapons: 62000, note: 'synthetic' },
    traces: [{ id: 't1', agent_name: 'triage', run_id: 'run-001', input: {}, output: { severity: 'critical' }, tools_called: [], latency_ms: 320, created_at: '2026-04-09T15:00:00Z' }],
    hitl_reviews: [],
  },
};

export const MOCK_PLAYBOOKS: Record<string, Playbook> = {
  'rotate-credentials': { slug: 'rotate-credentials', title_es: 'Rotación masiva de credenciales tras infostealer', body_md: '## Pasos\n1. Identificar cuentas expuestas.\n2. Forzar reset.\n3. MFA.', effort_hours: 6, cost_estimate_usd: 0, tags: ['infostealer'] },
  'enable-2fa': { slug: 'enable-2fa', title_es: 'Habilitar 2FA', body_md: 'Proxy SAML/OIDC o TOTP.', effort_hours: 3, cost_estimate_usd: 0, tags: ['mfa'] },
};

/** Prefijos de hash de prueba (seed) */
export const MOCK_HASH_PREFIXES: Record<string, string[]> = {
  a1b2c: ['e1000000-0000-4000-8000-000000000003'],
  d4e5f: ['e1000000-0000-4000-8000-000000000003'],
  f6a7b: ['e1000000-0000-4000-8000-000000000002'],
};

export function getMockEventDetail(id: string): ExposureEventDetail | null {
  return MOCK_EVENT_DETAILS[id] ?? null;
}
