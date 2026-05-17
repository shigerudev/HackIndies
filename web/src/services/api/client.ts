/**
 * Unified API facade — re-exports from `lib/*` which are the canonical
 * HackIndies clients. Components and hooks should ONLY import from here so
 * we have one entry point for future swapping or instrumentation.
 *
 * DO NOT add new fetch logic in this file. Add it to the right `lib/` module:
 *   - lib/api.ts          → events, HITL, triage, investigate, narrative
 *   - lib/playground-api.ts → health, institutions, citizen check, playbook, webhooks
 */

export {
  fetchEvents,
  fetchEvent,
  runTriage,
  runInvestigate,
  searchPlaybooks,
  fetchHitlPending,
  approveEvent,
  rejectEvent,
  generateNarrative,
  API_URL,
} from '@/lib/api'

export type {
  ExposureEvent,
  ExposureEventDetail,
} from '@/lib/api'

export {
  fetchHealth,
  fetchInstitutions,
  checkCitizen,
  fetchPlaybook,
  makeIngest,
  runPipeline,
  citizenAgentChat,
} from '@/lib/playground-api'

export type {
  Health,
  Institution,
  CitizenCheck,
  Playbook,
} from '@/lib/playground-api'

