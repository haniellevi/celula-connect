"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma } from '../../prisma/generated/client'

export type Devocional = Prisma.Devocional

export interface UseDevocionaisOptions {
  ativos?: boolean
  dataInicial?: Date
  dataFinal?: Date
  take?: number
  skip?: number
  enabled?: boolean
}

export interface DevocionaisResponse {
  data: Devocional[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useDevocionais(options: UseDevocionaisOptions = {}) {
  const queryKey = useMemo(
    () => ['devocionais', options] as const,
    [options],
  )

  return useQuery<DevocionaisResponse>({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.ativos === false) params.set('ativos', 'false')
      if (options.dataInicial) params.set('dataInicial', options.dataInicial.toISOString())
      if (options.dataFinal) params.set('dataFinal', options.dataFinal.toISOString())
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/devocionais${query}`)
    },
  })
}
