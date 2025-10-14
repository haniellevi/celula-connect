"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma, StatusAssinatura } from '../../prisma/generated/client'

export type IgrejaWithRelations = Prisma.IgrejaGetPayload<{
  include: {
    plano: true
    celulas: true
  }
}>

export interface UseIgrejasOptions {
  status?: StatusAssinatura[]
  search?: string
  includeInactive?: boolean
  includeCelulas?: boolean
  includePlano?: boolean
  take?: number
  skip?: number
  enabled?: boolean
}

type IgrejasResponse = {
  data: IgrejaWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useIgrejas(options: UseIgrejasOptions = {}) {
  const queryKey = useMemo(
    () => ['igrejas', options] as const,
    [options],
  )

  return useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.status?.length) params.set('status', options.status.join(','))
      if (options.search) params.set('search', options.search)
      if (options.includeInactive) params.set('includeInactive', 'true')
      if (options.includeCelulas) params.set('includeCelulas', 'true')
      if (options.includePlano === false) params.set('includePlano', 'false')
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<IgrejasResponse>(`/api/igrejas${query}`)
    },
  })
}
