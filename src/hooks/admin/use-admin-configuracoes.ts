"use client";

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface SystemConfigEntry {
  id?: string
  chave: string
  valor: string
  categoria: string
  descricao?: string | null
  tipoCampo?: string | null
  createdAt?: string
  updatedAt?: string
}

interface AdminSystemConfigResponse {
  data: SystemConfigEntry[]
  meta: {
    count: number
  }
}

interface UpsertSystemConfigInput {
  key: string
  value: string
  categoria: string
  descricao?: string | null
  tipoCampo?: string
}

interface DeleteSystemConfigInput {
  key: string
}

export function useAdminSystemConfig(categoria?: string) {
  const queryKey = useMemo(
    () => ['admin', 'system-config', categoria ?? 'all'] as const,
    [categoria],
  )

  return useQuery<AdminSystemConfigResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoria) params.set('categoria', categoria)
      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get(`/api/admin/configuracoes${query}`)
    },
  })
}

export function useUpsertSystemConfigEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertSystemConfigInput) =>
      api.put('/api/admin/configuracoes', {
        key: payload.key,
        value: payload.value,
        categoria: payload.categoria,
        descricao: payload.descricao,
        tipoCampo: payload.tipoCampo,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-config', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-config', variables.categoria] })
    },
  })
}

export function useDeleteSystemConfigEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DeleteSystemConfigInput) =>
      api.delete('/api/admin/configuracoes', {
        body: JSON.stringify({ key: payload.key }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-config', 'all'] })
    },
  })
}
