"use client";

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface DomainFeatureFlagsResponse {
  data: Record<string, boolean>
}

export function useDomainFeatureFlags() {
  return useQuery<DomainFeatureFlagsResponse>({
    queryKey: ['feature-flags', 'public'],
    queryFn: () => api.get('/api/admin/feature-flags?scope=public'),
    staleTime: 60_000,
  })
}
