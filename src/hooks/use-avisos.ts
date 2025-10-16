"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  Prisma,
  TipoAviso,
  PrioridadeAviso,
} from '../../prisma/generated/client'
import { useToast } from '@/hooks/use-toast'

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

export interface CreateAvisoInput {
  titulo: string
  conteudo: string
  tipo: TipoAviso
  prioridade: PrioridadeAviso
  dataInicio: string
  dataFim?: string | null
  igrejaId?: string
  celulaId?: string
  usuarioId?: string
  ativo?: boolean
}

export interface UpdateAvisoInput {
  id: string
  data: Partial<{
    titulo: string
    conteudo: string
    tipo: TipoAviso
    prioridade: PrioridadeAviso
    dataInicio: string
    dataFim: string | null
    igrejaId: string | null
    celulaId: string | null
    usuarioId: string | null
    ativo: boolean
  }>
}

export function useCreateAviso() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload: CreateAvisoInput) => {
      const response = await api.post<{ success: boolean; data: AvisoWithRelations }>(
        '/api/avisos',
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'], exact: false })
      toast({
        title: 'Aviso publicado',
        description: 'O aviso foi criado e está disponível no feed dos destinatários.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível publicar o aviso.'
      toast({
        title: 'Erro ao publicar',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateAviso() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateAvisoInput) => {
      const response = await api.patch<{ success: boolean; data: AvisoWithRelations }>(
        `/api/avisos/${id}`,
        data,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'], exact: false })
      toast({
        title: 'Aviso atualizado',
        description: 'As alterações do aviso foram aplicadas com sucesso.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o aviso.'
      toast({
        title: 'Erro ao atualizar',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAviso() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<{ success: boolean }>(`/api/avisos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'], exact: false })
      toast({
        title: 'Aviso removido',
        description: 'O aviso foi arquivado e não aparecerá mais no feed.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível remover o aviso.'
      toast({
        title: 'Erro ao remover',
        description: message,
        variant: 'destructive',
      })
    },
  })
}
