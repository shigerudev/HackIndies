'use client'

import { useHealth } from '@/hooks/useHealth'
import { useEvents } from '@/hooks/useEvents'
import { StatusPill } from '@/components/dashboard/primitives/StatusPill'
import { buildStatusMessage } from '@/lib/system-status'

export function SystemStatusPill() {
  const { online } = useHealth(30_000)
  const { events: pending } = useEvents({ status: 'pending_review', pollMs: 30_000 })
  const status = buildStatusMessage(online, pending.length)
  return <StatusPill state={status.state} label={status.label} />
}