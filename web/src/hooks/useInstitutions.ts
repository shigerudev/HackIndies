'use client'

import { useEffect, useState } from 'react'
import { formatApiError } from '@/hooks/formatApiError'
import { fetchInstitutions, type Institution } from '@/services/api/client'

export interface UseInstitutionsResult {
  institutions: Institution[]
  loading: boolean
  error: string | null
}

export function useInstitutions(): UseInstitutionsResult {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchInstitutions()
      .then(({ data }) => {
        if (!cancelled) setInstitutions(data)
      })
      .catch((err) => {
        if (!cancelled) setError(formatApiError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { institutions, loading, error }
}
