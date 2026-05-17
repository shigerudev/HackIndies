'use client'

import { useCallback, useState } from 'react'
import { formatApiError } from '@/hooks/formatApiError'
import { checkCitizen, type CitizenCheck } from '@/services/api/client'

/**
 * Compute the 5-char SHA-1 prefix of a lowercased email. The full hash never
 * leaves the browser — only the 5 chars travel to the backend (k-anonymity).
 */
async function sha1Prefix(email: string): Promise<string> {
  const trimmed = email.trim().toLowerCase()
  const buf = new TextEncoder().encode(trimmed)
  const hash = await crypto.subtle.digest('SHA-1', buf)
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hex.slice(0, 5)
}

export interface UseCitizenCheckResult {
  result: CitizenCheck | null
  prefix: string | null
  loading: boolean
  error: string | null
  check: (email: string) => Promise<void>
  reset: () => void
}

export function useCitizenCheck(): UseCitizenCheckResult {
  const [result, setResult] = useState<CitizenCheck | null>(null)
  const [prefix, setPrefix] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const p = await sha1Prefix(email)
      setPrefix(p)
      const data = await checkCitizen(p)
      setResult(data)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setPrefix(null)
    setError(null)
  }, [])

  return { result, prefix, loading, error, check, reset }
}
