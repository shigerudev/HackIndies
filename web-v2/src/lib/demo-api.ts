const API_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')
    : 'http://localhost:3001';

export interface DemoPreset {
  id: string;
  label: string;
  institution_slug: string;
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  credentials_count: number;
  actor_name?: string;
  event_id: string;
  story_note: string;
}

export interface PipelineResult {
  preset_id: string;
  event_id: string;
  already_run: boolean;
  replay: boolean;
  ingest?: { event_id: string; duplicate: boolean };
  triage: {
    institution_slug: string;
    severity: string;
    suggested_title: string;
    suggested_summary: string;
    malware_family: string | null;
    credentials_count_estimate: number;
    confidence: number;
    reasoning_brief: string;
  };
  investigation: {
    label: string;
    confidence: number;
    recommendation: string;
    reasoning_brief: string;
    hitl_required: boolean;
  };
  hitl_status: string;
  mock: boolean;
  run_ids: { triage: string; investigator: string };
}

export async function fetchPresets(): Promise<{ data: Record<string, DemoPreset> }> {
  const res = await fetch(`${API_URL}/api/dev/presets`);
  if (!res.ok) throw new Error(`Failed to fetch presets: ${res.status}`);
  return res.json();
}

export async function runPreset(presetId: string): Promise<PipelineResult> {
  const res = await fetch(`${API_URL}/api/dev/run-preset/${presetId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function resetEvent(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/dev/reset-event/${eventId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
}