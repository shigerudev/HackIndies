import { API_URL } from './api'

export type Health = {
  status: 'ok';
  supabase: boolean;
  minimax: boolean;
  make_webhook: boolean;
  make_api?: boolean;
  mock?: boolean;
  version?: string;
  timestamp?: string;
};

export async function fetchHealth(): Promise<Health> {
  const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export type Institution = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  country: string;
  domain_obfuscated: string;
};

export async function fetchInstitutions(): Promise<{ data: Institution[] }> {
  const res = await fetch(`${API_URL}/api/institutions`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export type CitizenCheck = {
  exposed: boolean;
  events: Array<{
    id: string;
    title: string;
    institution_name: string;
  }>;
  recommendations: string[];
  mock: boolean;
};

export async function checkCitizen(hashPrefix: string): Promise<CitizenCheck> {
  const res = await fetch(`${API_URL}/api/citizen/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash_prefix: hashPrefix }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type Playbook = {
  slug: string;
  title_es: string;
  body_md: string;
  effort_hours: number;
  cost_estimate_usd: number;
  tags: string[];
};

export async function fetchPlaybook(slug: string): Promise<{ data: Playbook }> {
  const res = await fetch(`${API_URL}/api/playbooks/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function makeIngest(payload: {
  institution_slug: string;
  title: string;
  severity: string;
  external_id: string;
}): Promise<{ success: boolean; event_id: string }> {
  const res = await fetch(`${API_URL}/api/webhooks/make/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Nomad-Webhook-Secret': 'nomad-make-dev-7f3a9c2e1b8d4f6a0e5c9b2d8f1a4e7',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runPipeline(eventId: string) {
  const res = await fetch(`${API_URL}/api/agent/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { API_URL } from './api';