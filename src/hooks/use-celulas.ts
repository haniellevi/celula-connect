"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma } from '../../prisma/generated/client'

export type CelulaWithRelations = Prisma.CelulaGetPayload<{
  include: {
    igreja: true
    lider: true
    supervisor: true
    membros: {
      include: {
        usuario: true
      }
    }
    reunioes: true
  }
}>

export interface UseCelulasOptions {
  igrejaId?: string
  liderId?: string
  supervisorId?: string
  search?: string
  includeMembers?: boolean
  take?: number
  skip?: number
  enabled?: boolean
}

type CelulasResponse = {
  data: CelulaWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useCelulas(options: UseCelulasOptions = {}) {
  const queryKey = useMemo(
    () => ['celulas', options] as const,
    [options],
  )

  return useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.igrejaId) params.set('igrejaId', options.igrejaId)
      if (options.liderId) params.set('liderId', options.liderId)
      if (options.supervisorId) params.set('supervisorId', options.supervisorId)
      if (options.search) params.set('search', options.search)
      if (options.includeMembers) params.set('includeMembers', 'true')
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<CelulasResponse>(`/api/celulas${query}`)
    },
  })
}
