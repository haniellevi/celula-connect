"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface FeatureFlagsResponse {
  data: Record<string, boolean>
}

export function useAdminFeatureFlags() {
  return useQuery<FeatureFlagsResponse>({
    queryKey: ['admin', 'feature-flags'],
    queryFn: () => api.get('/api/admin/feature-flags'),
    staleTime: 60_000,
  })
}

interface UpdateFeatureFlagInput {
  key: string
  enabled: boolean
  descricao?: string
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateFeatureFlagInput) =>
      api.put('/api/admin/feature-flags', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] })
    },
  })
}
