"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  Prisma,
  TipoAviso,
  PrioridadeAviso,
} from '../../prisma/generated/client'

export type AvisoWithRelations = Prisma.AvisoGetPayload<{
  include: {
    igreja: true
    celula: true
    usuario: true
  }
}>

export interface UseAvisosOptions {
  igrejaId?: string | null
  celulaId?: string | null
  usuarioId?: string | null
  tipo?: TipoAviso
  prioridade?: PrioridadeAviso
  ativos?: boolean
  referencia?: Date
  take?: number
  skip?: number
  includeIgreja?: boolean
  includeCelula?: boolean
  includeUsuario?: boolean
  enabled?: boolean
}

export interface AvisosResponse {
  data: AvisoWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useAvisos(options: UseAvisosOptions = {}) {
  const queryKey = useMemo(
    () => ['avisos', options] as const,
    [options],
  )

  return useQuery<AvisosResponse>({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.igrejaId) params.set('igrejaId', options.igrejaId)
      if (options.celulaId) params.set('celulaId', options.celulaId)
      if (options.usuarioId) params.set('usuarioId', options.usuarioId)
      if (options.tipo) params.set('tipo', options.tipo)
      if (options.prioridade) params.set('prioridade', options.prioridade)
      if (options.ativos === false) params.set('ativos', 'false')
      if (options.referencia) params.set('referencia', options.referencia.toISOString())
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))
      if (options.includeIgreja) params.set('includeIgreja', 'true')
      if (options.includeCelula) params.set('includeCelula', 'true')
      if (options.includeUsuario) params.set('includeUsuario', 'true')

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/avisos${query}`)
    },
  })
}
