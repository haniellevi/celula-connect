"use client";

import { useQuery } from '@tanstack/react-query'
import type { DomainUser } from '@/lib/domain-auth'
import { api } from '@/lib/api-client'

export interface DomainUserResponse {
  data: DomainUser
}

export function useDomainUser(enabled: boolean = true) {
  return useQuery<DomainUserResponse>({
    queryKey: ['domain-user'],
    enabled,
    queryFn: () => api.get('/api/domain/me'),
    staleTime: 2 * 60_000,
  })
