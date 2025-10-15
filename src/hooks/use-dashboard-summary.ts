"use client";

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export type DashboardPerfil = 'pastor' | 'supervisor' | 'lider'

export interface DashboardSummaryResponse {
  data: {
    perfil: DashboardPerfil
    stats: Record<string, number>
    generatedAt: string
  }
}

export function useDashboardSummary(perfil: DashboardPerfil) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary', perfil],
    queryFn: () => api.get(`/api/dashboard/${perfil}`),
    staleTime: 30_000,
  })
}
