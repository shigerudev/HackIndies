'use client'

import { useEffect, useState } from 'react'
import { formatApiError } from '@/hooks/formatApiError'
import { fetchHealth } from '@/lib/playground-api'
import type { Health } from '@/lib/playground-api'

export interface UseHealthResult {
  health: Health | null
  loading: boolean
  error: string | null
  online: boolean | null
}

/**
 * Polls /api/health and exposes a human-readable `online` flag.
 * Keeps the last-known value across polls so the UI never flashes empty.
 */
export function useHealth(intervalMs = 30_000): UseHealthResult {
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchHealth()
        if (!cancelled) {
          setHealth(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(formatApiError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  const online = error ? false : health ? health.status === 'ok' : null

  return { health, loading, error, online }
}