"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma, Testamento, TipoMeta, UnidadeTempo } from '../../prisma/generated/client'

type PaginatedResponse<T> = {
  data: T[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export type LivroBiblia = Prisma.LivroBibliaGetPayload<Prisma.LivroBibliaDefaultArgs>

export type CapituloComVersiculos = Prisma.CapituloBibliaGetPayload<{
  include: {
    livro: true
    versiculosBiblia: true
  }
}>

export type MetaLeituraWithRelations = Prisma.MetaLeituraGetPayload<{
  include: {
    igreja: true
    celula: true
    usuarios: {
      include: {
        usuario: true
        progressoAutomatico: true
      }
    }
    leituras: true
  }
}>

export type MetaLeituraUsuarioWithRelations = Prisma.MetaLeituraUsuarioGetPayload<{
  include: {
    meta: {
      include: {
        igreja: true
        celula: true
      }
    }
    progressoAutomatico: true
  }
}>

export type LeituraRegistroWithMeta = Prisma.LeituraRegistroGetPayload<{
  include: {
    meta: true
  }
}>

export interface UseBibliaLivrosOptions {
  testamento?: Testamento
  search?: string
  take?: number
  skip?: number
  enabled?: boolean
}

export function useBibliaLivros(options: UseBibliaLivrosOptions = {}) {
  const queryKey = useMemo(
    () => ['biblia', 'livros', options] as const,
    [options],
  )

  return useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.testamento) params.set('testamento', options.testamento)
      if (options.search) params.set('search', options.search)
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<PaginatedResponse<LivroBiblia>>(`/api/biblia/livros${query}`)
    },
  })
}

export interface UseBibliaCapitulosOptions {
  includeVersiculos?: boolean
  take?: number
  skip?: number
  enabled?: boolean
}

export function useBibliaCapitulos(
  livroId?: string,
  options: UseBibliaCapitulosOptions = {},
) {
  const queryKey = useMemo(
    () => ['biblia', 'livros', livroId ?? 'unknown', 'capitulos', options] as const,
    [livroId, options],
  )

  return useQuery({
    queryKey,
    enabled: Boolean(livroId) && (options.enabled ?? true),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.includeVersiculos) params.set('includeVersiculos', 'true')
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<PaginatedResponse<CapituloComVersiculos>>(
        `/api/biblia/livros/${livroId}/capitulos${query}`,
      )
    },
  })
}

export function useBibliaCapitulo(capituloId?: string, enabled = true) {
  const queryKey = useMemo(
    () => ['biblia', 'capitulo', capituloId ?? 'unknown'] as const,
    [capituloId],
  )

  return useQuery({
    queryKey,
    enabled: Boolean(capituloId) && enabled,
    queryFn: async () => api.get<CapituloComVersiculos>(`/api/biblia/capitulos/${capituloId}`),
  })
}

export interface UseBibliaMetasOptions {
  igrejaId?: string
  celulaId?: string | null
  ativo?: boolean
  includeUsuarios?: boolean
  includeLeituras?: boolean
  take?: number
  skip?: number
  enabled?: boolean
}

export function useBibliaMetas(options: UseBibliaMetasOptions = {}) {
  const queryKey = useMemo(
    () => ['biblia', 'metas', options] as const,
    [options],
  )

  return useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.igrejaId) params.set('igrejaId', options.igrejaId)
      if (options.celulaId !== undefined) params.set('celulaId', options.celulaId ?? 'null')
      if (typeof options.ativo === 'boolean') params.set('ativo', String(options.ativo))
      if (options.includeUsuarios) params.set('includeUsuarios', 'true')
      if (options.includeLeituras) params.set('includeLeituras', 'true')
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<PaginatedResponse<MetaLeituraWithRelations>>(`/api/biblia/metas${query}`)
    },
  })
}

export interface CreateMetaLeituraInput {
  titulo: string
  descricao?: string | null
  igrejaId: string
  celulaId?: string | null
  tipoMeta: TipoMeta
  valorMeta: number
  unidade: UnidadeTempo
  periodo: string
  dataInicio: string
  dataFim: string
  ativa?: boolean
}

export function useCreateMetaLeitura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateMetaLeituraInput) => {
      const response = await api.post<{ success: boolean; data: MetaLeituraWithRelations }>(
        '/api/biblia/metas',
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biblia', 'metas'] })
    },
  })
}

export interface UpdateMetaLeituraInput {
  id: string
  data: Partial<{
    titulo: string
    descricao: string | null
    igrejaId: string
    celulaId: string | null
    tipoMeta: TipoMeta
    valorMeta: number
    unidade: UnidadeTempo
    periodo: string
    dataInicio: string
    dataFim: string
    ativa: boolean
  }>
}

export function useUpdateMetaLeitura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateMetaLeituraInput) => {
      const response = await api.patch<{ success: boolean; data: MetaLeituraWithRelations }>(
        `/api/biblia/metas/${id}`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biblia', 'metas'] })
      queryClient.invalidateQueries({ queryKey: ['biblia', 'metas', 'usuario'] })
      queryClient.invalidateQueries({ queryKey: ['biblia', 'metas', variables.id] })
    },
  })
}

export function useDeleteMetaLeitura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<{ success: boolean }>(`/api/biblia/metas/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biblia', 'metas'] })
    },
  })
}

export interface UseBibliaMetasUsuarioOptions {
  ativoOnly?: boolean
  includeMeta?: boolean
  includeProgresso?: boolean
  take?: number
  skip?: number
  enabled?: boolean
}

export function useBibliaMetasUsuario(
  usuarioId?: string,
  options: UseBibliaMetasUsuarioOptions = {},
) {
  const queryKey = useMemo(
    () => ['biblia', 'metas', 'usuario', usuarioId ?? 'unknown', options] as const,
    [usuarioId, options],
  )

  return useQuery({
    queryKey,
    enabled: Boolean(usuarioId) && (options.enabled ?? true),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (typeof options.ativoOnly === 'boolean') params.set('ativoOnly', String(options.ativoOnly))
      if (typeof options.includeMeta === 'boolean') params.set('includeMeta', String(options.includeMeta))
      if (typeof options.includeProgresso === 'boolean') params.set('includeProgresso', String(options.includeProgresso))
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<PaginatedResponse<MetaLeituraUsuarioWithRelations>>(
        `/api/biblia/metas/usuarios/${usuarioId}${query}`,
      )
    },
  })
}

export interface UseBibliaLeiturasUsuarioOptions {
  order?: 'asc' | 'desc'
  take?: number
  skip?: number
  enabled?: boolean
}

export function useBibliaLeiturasUsuario(
  usuarioId?: string,
  options: UseBibliaLeiturasUsuarioOptions = {},
) {
  const queryKey = useMemo(
    () => ['biblia', 'leituras', 'usuario', usuarioId ?? 'unknown', options] as const,
    [usuarioId, options],
  )

  return useQuery({
    queryKey,
    enabled: Boolean(usuarioId) && (options.enabled ?? true),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.order) params.set('order', options.order)
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<PaginatedResponse<LeituraRegistroWithMeta>>(
        `/api/biblia/leituras/usuarios/${usuarioId}${query}`,
      )
    },
  })
}
