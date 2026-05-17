export const DIGECAM_TIMELINE = [
  {
    date: '~septiembre 2025',
    signal: 'Credenciales DIGECAM en mercados clandestinos',
    type: 'osint' as const,
    nomadAction: 'Ingest automático vía Make.com webhook',
    agent: 'make_ingest',
    source: 'OSINT (sintético)',
    note: 'Señales previas al ataque público — sin confirmación oficial aún',
  },
  {
    date: '9 abril 2026',
    signal: 'Confirmación pública de brecha DIGECAM',
    type: 'public_report' as const,
    nomadAction: 'Triage clasifica como critical + Investigator propone approve_for_review',
    agent: 'triage + investigator',
    source: 'Reporte Vector Crítico',
    note: 'Triage en 320ms · Investigator en ~3s con MiniMax',
  },
  {
    date: '10 abril 2026',
    signal: 'Comunicado MINDEF — 21,700 credenciales expuestas',
    type: 'public_report' as const,
    nomadAction: 'HITL review pending · alerta a ciudadano',
    agent: 'hitl + citizen',
    source: 'Comunicado oficial MINDEF',
    note: 'Humano decide si publicar o rechazar',
  },
  {
    date: 'Post-brecha',
    signal: 'Playbook de rotación masiva + 2FA',
    type: 'remediation' as const,
    nomadAction: 'DefenderBriefing agent entrega playbook en español',
    agent: 'defender',
    source: 'docs/DEMO-SCRIPT.md',
    note: 'Tiempo estimado: 4-8h · Costo: $0',
  },
];

export const DIGECAM_STATS = {
  monthsOfAdvantage: 7,
  credentialsExposed: 21700,
  daysBetweenSignalAndConfirmation: 213,
  vectorCriticoReference: 'https://vectorcritico.com/las-claves-de-la-crisis-de-ciberseguridad-en-guatemala/',
};