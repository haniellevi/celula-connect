"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface LandingConfigEntry {
  id: string
  secao: string
  chave: string
  valor: string
  tipo?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LandingConfigResponse {
  data: LandingConfigEntry[]
  meta: {
    count: number
  }
}

export function useLandingConfig(section?: string, enabled: boolean = true) {
  const queryKey = useMemo(
    () => ['landing-config', section ?? 'all'] as const,
    [section],
  )

  return useQuery<LandingConfigResponse>({
    queryKey,
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (section) params.set('section', section)
      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/public/landing-config${query}`)
    },
    staleTime: 5 * 60_000,
  })
}
