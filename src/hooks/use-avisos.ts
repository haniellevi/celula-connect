"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { AvisoWithRelations, TipoAviso, PrioridadeAviso } from '@/types/avisos'
export type { AvisoWithRelations } from '@/types/avisos'
import { useToast } from '@/hooks/use-toast'

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

const PRIORIDADE_ORDER: Record<PrioridadeAviso, number> = {
  URGENTE: 0,
  ALTA: 1,
  NORMAL: 2,
  BAIXA: 3,
}

type AvisoScope = 'usuario' | 'celula' | 'igreja' | 'geral'

export interface UseAvisosFeedContext {
  usuarioId?: string
  celulaIds?: string[]
  igrejaId?: string
}

export interface AvisoFeedItem {
  aviso: AvisoWithRelations
  status: 'ATIVO' | 'AGENDADO' | 'EXPIRADO'
  scope: AvisoScope
  scopeLabel: string
  dataInicio: Date
  dataFim: Date | null
  isUrgente: boolean
  isAgendado: boolean
}

export function useAvisosFeed(
  options: UseAvisosOptions = {},
  context: UseAvisosFeedContext = {},
) {
  const query = useAvisos({
    ...options,
    includeIgreja: true,
    includeCelula: true,
    includeUsuario: true,
  })

  type SortMeta = { priorityRank: number; statusRank: number; scopeRank: number; timeRank: number }
  type Intermediate = AvisoFeedItem & { sortMeta: SortMeta }

  const items = useMemo<AvisoFeedItem[]>(() => {
    const now = new Date()
    const avisos = query.data?.data ?? []

    return avisos
      .map<Intermediate>((aviso) => {
        const dataInicio = new Date(aviso.dataInicio)
        const dataFim = aviso.dataFim ? new Date(aviso.dataFim) : null
        const ativo = aviso.ativo && dataInicio <= now && (!dataFim || dataFim >= now)
        const agendado = aviso.ativo && dataInicio > now
        let scope: AvisoScope = 'geral'
        let scopeLabel = 'Comunicado geral'
        let scopeRank = 3

        if (aviso.usuarioId) {
          scope = 'usuario'
          const matches = aviso.usuarioId === context.usuarioId
          scopeLabel = matches ? 'Direcionado a você' : 'Usuário específico'
          scopeRank = matches ? 0 : 3
        } else if (aviso.celulaId) {
          scope = 'celula'
          const matchCelula = context.celulaIds?.includes(aviso.celulaId) ?? false
          scopeLabel = matchCelula ? 'Sua célula' : 'Outras células'
          scopeRank = matchCelula ? 1 : 2
        } else if (aviso.igrejaId) {
          scope = 'igreja'
          const matchIgreja = aviso.igrejaId === context.igrejaId
          scopeLabel = matchIgreja ? 'Sua igreja' : 'Rede'
          scopeRank = matchIgreja ? 2 : 3
        }

        return {
          aviso,
          status: (ativo ? 'ATIVO' : agendado ? 'AGENDADO' : 'EXPIRADO') as 'ATIVO' | 'AGENDADO' | 'EXPIRADO',
          scope,
          scopeLabel,
          dataInicio,
          dataFim,
          isUrgente: aviso.prioridade === 'URGENTE',
          isAgendado: agendado,
          sortMeta: {
            priorityRank: PRIORIDADE_ORDER[aviso.prioridade],
            statusRank: ativo ? 0 : agendado ? 1 : 2,
            scopeRank,
            timeRank: agendado ? dataInicio.getTime() : -dataInicio.getTime(),
          },
        }
      })
      .filter((item) => item.status !== 'EXPIRADO')
      .sort((a, b) => {
        if (a.sortMeta.statusRank !== b.sortMeta.statusRank) {
          return a.sortMeta.statusRank - b.sortMeta.statusRank
        }
        if (a.sortMeta.priorityRank !== b.sortMeta.priorityRank) {
          return a.sortMeta.priorityRank - b.sortMeta.priorityRank
        }
        if (a.sortMeta.scopeRank !== b.sortMeta.scopeRank) {
          return a.sortMeta.scopeRank - b.sortMeta.scopeRank
        }
        return a.sortMeta.timeRank - b.sortMeta.timeRank
      })
      .slice(0, options.take ?? 5)
      .map((item) => {
        const { sortMeta, ...rest } = item
        void sortMeta
        return rest
      })
  }, [context.celulaIds, context.igrejaId, context.usuarioId, options.take, query.data?.data])

  const urgentCount = useMemo(
    () => items.filter((item) => item.isUrgente).length,
    [items],
  )
  const upcomingCount = useMemo(
    () => items.filter((item) => item.isAgendado).length,
    [items],
  )

  return {
    ...query,
    items,
    urgentCount,
    upcomingCount,
  }
}
