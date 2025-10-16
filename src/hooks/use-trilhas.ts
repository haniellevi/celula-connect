"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma } from '../../prisma/generated/client'

export type TrilhaWithRelations = Prisma.TrilhaCrescimentoGetPayload<{
  include: {
    usuariosTrilha: {
      include: {
        usuario: true
      }
    }
    etapasArea: {
      include: {
        area: true
      }
    }
  }
}>

export interface UseTrilhasOptions {
  search?: string
  ativa?: boolean
  take?: number
  skip?: number
  includeUsuarios?: boolean
  includeAreas?: boolean
  enabled?: boolean
}

interface TrilhasResponse {
  data: TrilhaWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useTrilhas(options: UseTrilhasOptions = {}) {
  const queryKey = useMemo(() => ['trilhas', options] as const, [options])

  return useQuery<TrilhasResponse>({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.search) params.set('search', options.search)
      if (typeof options.ativa === 'boolean') params.set('ativa', String(options.ativa))
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))
      if (options.includeUsuarios === false) params.set('includeUsuarios', 'false')
      if (options.includeAreas === false) params.set('includeAreas', 'false')

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/trilhas${query}`)
    },
    staleTime: 30_000,
  })
}
