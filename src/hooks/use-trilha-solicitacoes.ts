"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma, StatusSolicitacao } from '../../prisma/generated/client'
import { useToast } from '@/hooks/use-toast'

export type SolicitacaoTrilhaWithRelations = Prisma.SolicitacaoAvancoTrilhaGetPayload<{
  include: {
    usuario: true
    trilha: true
    liderSolicitante: true
    area: true
    supervisorResponsavel: true
  }
}>

export interface UseTrilhaSolicitacoesOptions {
  status?: StatusSolicitacao
  scope?: 'mine' | 'lider' | 'pendentes' | 'all'
  take?: number
  skip?: number
  includeUsuario?: boolean
  includeTrilha?: boolean
  includeArea?: boolean
  includeLider?: boolean
  includeSupervisor?: boolean
  enabled?: boolean
}

interface SolicitacoesResponse {
  data: SolicitacaoTrilhaWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useTrilhaSolicitacoes(options: UseTrilhaSolicitacoesOptions = {}) {
  const queryKey = useMemo(() => ['trilha-solicitacoes', options] as const, [options])

  return useQuery<SolicitacoesResponse>({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.scope) params.set('scope', options.scope)
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))
      if (options.includeUsuario === false) params.set('includeUsuario', 'false')
      if (options.includeTrilha === false) params.set('includeTrilha', 'false')
      if (options.includeArea === false) params.set('includeArea', 'false')
      if (options.includeLider === false) params.set('includeLider', 'false')
      if (options.includeSupervisor) params.set('includeSupervisor', 'true')

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/trilhas/solicitacoes${query}`)
    },
    staleTime: 60_000,
  })
}

export interface UpdateSolicitacaoTrilhaInput {
  id: string
  data: Partial<{
    status: StatusSolicitacao
    observacoesSupervisor: string | null
    observacoesLider: string | null
    motivo: string | null
    areaSupervisaoId: string
    supervisorResponsavelId: string
  }>
}

export function useUpdateSolicitacaoTrilha() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateSolicitacaoTrilhaInput) => {
      const response = await api.patch<{
        success: boolean
        data: SolicitacaoTrilhaWithRelations
      }>(`/api/trilhas/solicitacoes/${id}`, data)
      return response.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['trilha-solicitacoes'] })
      toast({
        title: 'Solicitação atualizada',
        description: `Status atual: ${result.data.status}`,
      })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Não foi possível atualizar a solicitação.'
      toast({
        title: 'Falha ao atualizar solicitação',
        description: message,
        variant: 'destructive',
      })
    },
  })
}
