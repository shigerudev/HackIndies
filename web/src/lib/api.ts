import type { Playbook } from './playground-api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ExposureEvent = {
  id: string;
  title: string;
  summary: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  institution_slug: string;
  institution_name: string;
  actor_name: string | null;
  credentials_count: number;
  first_seen_at: string;
};

export type ExposureEventDetail = ExposureEvent & {
  payload: Record<string, unknown>;
  traces: Array<{
    id: string;
    agent_name: string;
    run_id: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    tools_called: unknown[];
    latency_ms: number | null;
    created_at: string;
  }>;
  hitl_reviews: Array<{
    id: string;
    reviewer: string;
    decision: string;
    comment: string | null;
    decided_at: string;
  }>;
};

export async function fetchEvents(params?: { status?: string; severity?: string }): Promise<{
  data: ExposureEvent[];
  mock: boolean;
}> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.severity) sp.set('severity', params.severity);
  const qs = sp.toString() ? `?${sp.toString()}` : '';
  const res = await fetch(`${API_URL}/api/events${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchEvent(id: string): Promise<{ data: ExposureEventDetail; mock: boolean }> {
  const res = await fetch(`${API_URL}/api/events/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function runTriage(eventId: string) {
  const res = await fetch(`${API_URL}/api/agent/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runInvestigate(eventId: string, triage?: unknown) {
  const res = await fetch(`${API_URL}/api/agent/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId, triage }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchPlaybooks(q: string, mode: 'fts' | 'vector' | 'auto' = 'auto'): Promise<{
  data: Playbook[];
  mock?: boolean;
  query?: string;
  mode?: string;
}> {
  const modeParam = mode !== 'auto' ? `&mode=${mode}` : '';
  const res = await fetch(`${API_URL}/api/playbooks/search?q=${encodeURIComponent(q)}${modeParam}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchHitlPending(): Promise<{ data: ExposureEvent[]; mock: boolean }> {
  const res = await fetch(`${API_URL}/api/hitl/pending`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function approveEvent(eventId: string, reviewer: string, comment?: string) {
  const res = await fetch(`${API_URL}/api/hitl/${eventId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hitl-token': process.env.NEXT_PUBLIC_HITL_TOKEN ?? '' },
    body: JSON.stringify({ reviewer, comment }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function rejectEvent(eventId: string, reviewer: string, comment?: string) {
  const res = await fetch(`${API_URL}/api/hitl/${eventId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hitl-token': process.env.NEXT_PUBLIC_HITL_TOKEN ?? '' },
    body: JSON.stringify({ reviewer, comment }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateNarrative(eventId: string) {
  const res = await fetch(`${API_URL}/api/agent/narrative`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { API_URL };
