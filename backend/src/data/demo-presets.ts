import type { MakeIngestBody } from '../lib/make-ingest.js';

export interface DemoPreset {
  id: string;
  label: string;
  institution_slug: string;
  title: string;
  summary: string;
  severity: MakeIngestBody['severity'];
  credentials_count: number;
  actor_name?: string;
  malware_family?: string;
  event_id: string;
  story_note: string;
  ingest_payload: MakeIngestBody;
}

export const DEMO_PRESETS: Record<string, DemoPreset> = {
  'digecam-2026-04': {
    id: 'digecam-2026-04',
    label: 'DIGECAM — Abril 2026',
    institution_slug: 'digecam',
    title: 'Incidente confirmado — registro de armas DIGECAM',
    summary:
      'Brecha confirmada por la institución tras análisis independiente. Aproximadamente 21,700 credenciales de empleados del Ministerio de Defensa expuestas en mercados clandestinos.',
    severity: 'critical',
    credentials_count: 21700,
    actor_name: 'GordonFreeman',
    event_id: 'e1000000-0000-4000-8000-000000000002',
    story_note:
      'Esta es la brecha de DIGECAM confirmada públicamente en abril 2026. En el timeline real, las primeras señales OSINT aparecieron meses antes.',
    ingest_payload: {
      institution_slug: 'digecam',
      title: 'Incidente confirmado — registro de armas DIGECAM',
      summary:
        'Brecha confirmada por la institución tras análisis independiente. Aproximadamente 21,700 credenciales de empleados del Ministerio de Defensa expuestas en mercados clandestinos.',
      severity: 'critical',
      credentials_count: 21700,
      actor_name: 'GordonFreeman',
      external_id: 'demo-digecam-2026-04',
    },
  },
  'mintrab-tu-empleo': {
    id: 'mintrab-tu-empleo',
    label: 'MINTRAB — Portal Tu Empleo',
    institution_slug: 'mintrab-tu-empleo',
    title: 'Portal Tu Empleo — exfiltración masiva',
    summary:
      'API sin controles de acceso; currículos con metadatos personales sintéticos. Aproximadamente 200,000 registros de buscadores de empleo expuestos.',
    severity: 'critical',
    credentials_count: 200000,
    actor_name: 'GordonFreeman',
    event_id: 'e1000000-0000-4000-8000-000000000003',
    story_note:
      'El portal Tu Empleo fue uno de los primeros sistemas comprometidos. La exposición permitió acceso a datos personales de cientos de miles de guatemaltecos.',
    ingest_payload: {
      institution_slug: 'mintrab-tu-empleo',
      title: 'Portal Tu Empleo — exfiltración masiva',
      summary:
        'API sin controles de acceso; currículos con metadatos personales sintéticos. Aproximadamente 200,000 registros de buscadores de empleo expuestos.',
      severity: 'critical',
      credentials_count: 200000,
      actor_name: 'GordonFreeman',
      external_id: 'demo-mintrab-tu-empleo',
    },
  },
  'renap-claimed': {
    id: 'renap-claimed',
    label: 'RENAP — claimed breach',
    institution_slug: 'renap',
    title: 'RENAP — credenciales en mercado clandestino',
    summary:
      'Lote de credenciales ofrecido en foro clandestino. RENAP emitió comunicado negando la brecha oficialmente.',
    severity: 'high',
    credentials_count: 40300,
    actor_name: 'Team L4TAMFUCKERS',
    event_id: 'e1000000-0000-4000-8000-000000000006',
    story_note:
      'Caso típico de claimed breach: atacante afirma tener datos pero la institución niega. El workflow HITL de NOMAD es exactamente para estos casos — un humano verifica antes de publicar.',
    ingest_payload: {
      institution_slug: 'renap',
      title: 'RENAP — credenciales en mercado clandestino',
      summary:
        'Lote de credenciales ofrecido en foro clandestino. RENAP emitió comunicado negando la brecha oficialmente.',
      severity: 'high',
      credentials_count: 40300,
      actor_name: 'Team L4TAMFUCKERS',
      external_id: 'demo-renap-claimed',
    },
  },
};