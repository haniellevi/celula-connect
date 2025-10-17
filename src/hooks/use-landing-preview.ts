"use client";

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { LandingPreviewPayload } from '@/lib/landing-config/types'

interface LandingPreviewResponse {
  data: LandingPreviewPayload
}

export function useLandingPreview(enabled: boolean = true) {
  return useQuery<LandingPreviewResponse>({
    queryKey: ['landing-preview'],
    enabled,
    queryFn: async () => api.get('/api/public/landing-preview'),
    staleTime: 5 * 60_000,
  })
}
