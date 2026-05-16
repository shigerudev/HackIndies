/** Copia para deploy Vercel — mantener en sync con shared/types/api.ts */

export interface Institution {
  id: string;
  slug: string;
  name: string;
  sector: string;
  country: string;
  domain_obfuscated: string;
}

export interface ExposureEvent {
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
  malware_family?: string | null;
  source_type?: string;
}

export interface ExposureEventDetail extends ExposureEvent {
  payload: Record<string, unknown>;
  traces: AgentTrace[];
  hitl_reviews: HitlReview[];
}

export interface AgentTrace {
  id: string;
  agent_name: string;
  run_id: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  tools_called: unknown[];
  latency_ms: number | null;
  created_at: string;
}

export interface HitlReview {
  id: string;
  reviewer: string;
  decision: string;
  comment: string | null;
  decided_at: string;
}

export interface Playbook {
  slug: string;
  title_es: string;
  body_md: string;
  effort_hours: number;
  cost_estimate_usd: number;
  tags: string[];
}

export interface CitizenCheckResult {
  exposed: boolean;
  events: Array<{ id: string; title: string; institution_name: string }>;
  recommendations: string[];
  mock: boolean;
}

export interface ApiListResponse<T> {
  data: T[];
  mock: boolean;
}
