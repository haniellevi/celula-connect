"use client";

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface FeatureFlagPayload {
  data: Record<string, boolean>
}

export function useFeatureFlag(flagKey: string) {
  const query = useQuery<FeatureFlagPayload>({
    queryKey: ['feature-flag', flagKey],
    enabled: Boolean(flagKey),
    queryFn: async () => api.get(`/api/admin/feature-flags?scope=public`),
    staleTime: 60_000,
  })

  const value = query.data?.data?.[flagKey] ?? false
  return { ...query, value }
}
