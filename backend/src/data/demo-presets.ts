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