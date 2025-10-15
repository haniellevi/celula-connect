"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma } from '../../prisma/generated/client'

export type ConviteWithRelations = Prisma.ConviteGetPayload<{
  include: {
    celula: true
    convidadoPor: true
    usadoPor: true
  }
}>

export interface UseConvitesOptions {
  celulaId?: string
  convidadoPorId?: string
  usado?: boolean
  take?: number
  skip?: number
  includeCelula?: boolean
  includeConvidadoPor?: boolean
  includeUsadoPor?: boolean
  enabled?: boolean
}

export interface ConvitesResponse {
  data: ConviteWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useConvites(options: UseConvitesOptions = {}) {
  const queryKey = useMemo(
    () => ['convites', options] as const,
    [options],
  )

  return useQuery<ConvitesResponse>({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.celulaId) params.set('celulaId', options.celulaId)
      if (options.convidadoPorId) params.set('convidadoPorId', options.convidadoPorId)
      if (typeof options.usado === 'boolean') params.set('usado', String(options.usado))
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))
      if (options.includeCelula) params.set('includeCelula', 'true')
      if (options.includeConvidadoPor) params.set('includeConvidadoPor', 'true')
      if (options.includeUsadoPor) params.set('includeUsadoPor', 'true')

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/convites${query}`)
    },
  })
}
