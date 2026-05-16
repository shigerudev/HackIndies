/**
 * Prueba Triage + Investigator en evento pending_review del seed.
 * Uso: cd backend && npm run test:agents
 */
import 'dotenv/config';

const PROD = process.argv.includes('--prod');
const API =
  process.env.API_BASE_URL ??
  (PROD ? 'https://nomad-centinela-api.vercel.app' : 'http://127.0.0.1:3001');
const EVENT_ID = 'e1000000-0000-4000-8000-000000000006'; // RENAP pending_review
const FETCH_TIMEOUT_MS = 90_000;

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const body = await res.json();
  return { res, body };
}

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

async function main() {
  console.log(`--- NOMAD Centinela — Agents + API smoke (${API}) ---\n`);

  const { res: healthRes, body: health } = await fetchJson(`${API}/api/health`);
  assert(healthRes.ok, `health status ${healthRes.status}`);
  console.log('Health OK:', JSON.stringify(health));
  assert(health.supabase === true || health.mock === true, 'health debe reportar supabase o mock');

  const { res: instRes, body: inst } = await fetchJson(`${API}/api/institutions`);
  assert(instRes.ok, `institutions status ${instRes.status}`);
  console.log('Institutions OK:', inst.data?.length ?? 0);
  assert((inst.data?.length ?? 0) >= 8, 'institutions debe tener >= 8');

  const { res: evRes, body: events } = await fetchJson(
    `${API}/api/events?status=pending_review`,
  );
  assert(evRes.ok, `events status ${evRes.status}`);
  console.log('Events pending_review:', events.data?.length ?? 0);
  assert((events.data?.length ?? 0) >= 1, 'esperaba >=1 evento pending_review en seed');

  const { res: cChit, body: cHit } = await fetchJson(`${API}/api/citizen/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash_prefix: 'a1b2c' }),
  });
  assert(cChit.ok, `citizen/check a1b2c status ${cChit.status}`);
  console.log('Citizen check (a1b2c):', cHit.exposed, `(${cHit.events?.length ?? 0} evt)`);
  assert(cHit.exposed === true, 'a1b2c debe estar expuesto en el seed');

  const { res: cCmiss, body: cMiss } = await fetchJson(`${API}/api/citizen/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash_prefix: 'zzzzz' }),
  });
  assert(cCmiss.ok, `citizen/check zzzzz status ${cCmiss.status}`);
  console.log('Citizen check (zzzzz):', cMiss.exposed);
  assert(cMiss.exposed === false, 'zzzzz no debe estar expuesto');

  const { res: triageRes, body: triage } = await fetchJson(`${API}/api/agent/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: EVENT_ID }),
  });
  assert(triageRes.ok, `triage status ${triageRes.status}`);
  console.log('Triage OK:', triage.triage?.severity, triage.mock ? '(mock)' : '(minimax)');

  const { res: invRes, body: inv } = await fetchJson(`${API}/api/agent/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: EVENT_ID, triage: triage.triage }),
  });
  assert(invRes.ok, `investigate status ${invRes.status}`);
  console.log('Investigator OK:', inv.investigation?.label, inv.investigation?.recommendation);

  const { res: ragRes, body: rag } = await fetchJson(
    `${API}/api/playbooks/search?q=infostealer`,
  );
  assert(ragRes.ok, `playbooks/search status ${ragRes.status}`);
  console.log('RAG playbooks:', rag.data?.length ?? 0);
  assert((rag.data?.length ?? 0) >= 1, 'esperaba >=1 playbook para infostealer');

  console.log('\nOK: full smoke pipeline');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
