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

async function main() {
  console.log(`--- NOMAD Centinela — Agents test (${API}) ---\n`);

  const { res: triageRes, body: triage } = await fetchJson(`${API}/api/agent/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: EVENT_ID }),
  });
  if (!triageRes.ok) {
    console.error('Triage FAIL', triage);
    process.exit(1);
  }
  console.log('Triage OK:', triage.triage?.severity, triage.mock ? '(mock)' : '(minimax)');

  const { res: invRes, body: inv } = await fetchJson(`${API}/api/agent/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: EVENT_ID, triage: triage.triage }),
  });
  if (!invRes.ok) {
    console.error('Investigator FAIL', inv);
    process.exit(1);
  }
  console.log('Investigator OK:', inv.investigation?.label, inv.investigation?.recommendation);

  const ragRes = await fetch(`${API}/api/playbooks/search?q=infostealer`);
  const rag = await ragRes.json();
  console.log('RAG playbooks:', rag.data?.length ?? 0, 'results');

  console.log('\nOK: agents pipeline');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
