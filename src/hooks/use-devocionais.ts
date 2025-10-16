"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma } from '../../prisma/generated/client'
import { useToast } from '@/hooks/use-toast'

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

export interface CreateDevocionalInput {
  titulo: string
  versiculoReferencia: string
  versiculoTexto: string
  conteudo: string
  dataDevocional: string
  ativo?: boolean
}

export interface UpdateDevocionalInput {
  id: string
  data: Partial<{
    titulo: string
    versiculoReferencia: string
    versiculoTexto: string
    conteudo: string
    dataDevocional: string
    ativo: boolean
  }>
}

export function useCreateDevocional() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload: CreateDevocionalInput) => {
      const response = await api.post<{ success: boolean; data: DevocionaisResponse['data'][number] }>(
        '/api/devocionais',
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devocionais'], exact: false })
      toast({
        title: 'Devocional publicado',
        description: 'O devocional estará disponível na data agendada.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível publicar o devocional.'
      toast({
        title: 'Erro ao publicar',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateDevocional() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateDevocionalInput) => {
      const response = await api.patch<{ success: boolean; data: DevocionaisResponse['data'][number] }>(
        `/api/devocionais/${id}`,
        data,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devocionais'], exact: false })
      toast({
        title: 'Devocional atualizado',
        description: 'As alterações foram aplicadas com sucesso.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o devocional.'
      toast({
        title: 'Erro ao atualizar',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteDevocional() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<{ success: boolean }>(`/api/devocionais/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devocionais'], exact: false })
      toast({
        title: 'Devocional removido',
        description: 'O conteúdo foi arquivado.',
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível remover o devocional.'
      toast({
        title: 'Erro ao remover',
        description: message,
        variant: 'destructive',
      })
    },
  })
}
