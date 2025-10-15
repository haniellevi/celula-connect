"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { LandingConfigEntry } from '@/hooks/use-landing-config'

interface AdminLandingConfigResponse {
  data: LandingConfigEntry[]
  meta: {
    count: number
  }
}

interface UpsertLandingConfigInput {
  section: string
  key: string
  value: string
  type?: string
}

interface DeleteLandingConfigInput {
  section: string
  key: string
}

export function useAdminLandingConfig(section?: string) {
  const queryKey = useMemo(
    () => ['admin', 'landing-config', section ?? 'all'] as const,
    [section],
  )

  return useQuery<AdminLandingConfigResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (section) params.set('section', section)
      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/admin/landing-config${query}`)
    },
  })
}

export function useUpsertLandingConfigEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertLandingConfigInput) =>
      api.put('/api/admin/landing-config', {
        section: payload.section,
        key: payload.key,
        value: payload.value,
        type: payload.type,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'landing-config', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'landing-config', variables.section] })
      queryClient.invalidateQueries({ queryKey: ['landing-config', variables.section] })
    },
  })
}

export function useDeleteLandingConfigEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DeleteLandingConfigInput) =>
      api.delete('/api/admin/landing-config', {
        body: JSON.stringify({
          section: payload.section,
          key: payload.key,
        }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'landing-config', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'landing-config', variables.section] })
      queryClient.invalidateQueries({ queryKey: ['landing-config', variables.section] })
    },
  })
}
