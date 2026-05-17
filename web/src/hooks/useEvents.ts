'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatApiError } from '@/hooks/formatApiError'
import { fetchEvents, type ExposureEvent } from '@/services/api/client'

export interface UseEventsParams {
  status?: string
  severity?: string
  /** Poll interval in ms. 0 = no polling. Default: 0 */
  pollMs?: number
}

export interface UseEventsResult {
  events: ExposureEvent[]
  isMock: boolean
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEvents(params: UseEventsParams = {}): UseEventsResult {
  const { status, severity, pollMs = 0 } = params
  const [events, setEvents] = useState<ExposureEvent[]>([])
  const [isMock, setIsMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { data, mock } = await fetchEvents(
        status || severity ? { ...(status ? { status } : {}), ...(severity ? { severity } : {}) } : undefined
      )
      setEvents(data)
      setIsMock(mock)
      setError(null)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [status, severity])

  useEffect(() => {
    setLoading(true)
    load()
    if (pollMs > 0) {
      const id = setInterval(load, pollMs)
      return () => clearInterval(id)
    }
  }, [load, pollMs])

  return { events, isMock, loading, error, refetch: load }
}
