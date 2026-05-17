'use client'

import { useCallback, useState } from 'react'
import { formatApiError } from '@/hooks/formatApiError'
import { runTriage, runInvestigate, runPipeline } from '@/services/api/client'

export type AgentAction = 'triage' | 'investigate' | 'pipeline'

export interface AgentRunResult {
  action: AgentAction
  event_id: string
  triage?: {
    institution_slug: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    suggested_title: string
    suggested_summary: string
    malware_family: string | null
    credentials_count_estimate: number
    confidence: number
    reasoning_brief: string
  }
  investigation?: {
    label: 'confirmed' | 'strong_evidence' | 'claimed'
    confidence: number
    sources_summary: Array<{ source_type: string; note: string }>
    recommendation: 'approve_for_review' | 'needs_more_info' | 'reject'
    reasoning_brief: string
    hitl_required: boolean
  }
  hitl_status?: string
  mock: boolean
  duration_ms: number
  raw: unknown
}

export interface UseAgentRunResult {
  running: boolean
  result: AgentRunResult | null
  error: string | null
  run: (action: AgentAction, eventId: string) => Promise<void>
  reset: () => void
}

/**
 * Drives the three agent endpoints: triage, investigate, pipeline.
 * One hook, one mental model: pick action → pick event → run.
 */
export function useAgentRun(): UseAgentRunResult {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: AgentAction, eventId: string) => {
    setRunning(true)
    setError(null)
    setResult(null)
    const t0 = Date.now()
    try {
      let raw: any
      if (action === 'triage') {
        raw = await runTriage(eventId)
      } else if (action === 'investigate') {
        raw = await runInvestigate(eventId)
      } else {
        raw = await runPipeline(eventId)
      }
      setResult({
        action,
        event_id: eventId,
        triage: raw.triage,
        investigation: raw.investigation,
        hitl_status: raw.hitl_status,
        mock: !!raw.mock,
        duration_ms: Date.now() - t0,
        raw,
      })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setRunning(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { running, result, error, run, reset }
}
