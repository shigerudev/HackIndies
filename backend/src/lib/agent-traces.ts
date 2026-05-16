import { randomUUID } from 'node:crypto';
import { getSupabase } from './supabase.js';
import { hasSupabase } from './env.js';

export async function saveAgentTrace(params: {
  agent_name: string;
  event_id?: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  tools_called: unknown[];
  latency_ms: number;
  run_id?: string;
}): Promise<{ run_id: string; trace_id: string | null }> {
  const run_id = params.run_id ?? randomUUID();
  if (!hasSupabase()) {
    return { run_id, trace_id: null };
  }

  const sb = getSupabase()!;
  const { data, error } = await sb
    .from('agent_traces')
    .insert({
      agent_name: params.agent_name,
      run_id,
      event_id: params.event_id ?? null,
      input: params.input,
      output: params.output,
      tools_called: params.tools_called,
      latency_ms: params.latency_ms,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { run_id, trace_id: data?.id ?? null };
}
