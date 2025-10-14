"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Prisma, PerfilUsuario } from '../../prisma/generated/client'

export type UsuarioWithRelations = Prisma.UsuarioGetPayload<{
  include: {
    igreja: true
  }
}>

export interface UseUsuariosOptions {
  perfil?: PerfilUsuario | PerfilUsuario[]
  igrejaId?: string
  includeInactive?: boolean
  search?: string
  take?: number
  skip?: number
  includeIgreja?: boolean
  enabled?: boolean
}

type UsuariosResponse = {
  data: UsuarioWithRelations[]
  meta: {
    count: number
    hasMore: boolean
  }
}

export function useUsuarios(options: UseUsuariosOptions = {}) {
  const queryKey = useMemo(
    () => ['usuarios', options] as const,
    [options],
  )

  return useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.perfil) {
        const perfis = Array.isArray(options.perfil)
          ? options.perfil
          : [options.perfil]
        params.set('perfil', perfis.join(','))
      }
      if (options.igrejaId) params.set('igrejaId', options.igrejaId)
      if (options.includeInactive) params.set('includeInactive', 'true')
      if (options.search) params.set('search', options.search)
      if (options.includeIgreja) params.set('includeIgreja', 'true')
      if (typeof options.take === 'number') params.set('take', String(options.take))
      if (typeof options.skip === 'number') params.set('skip', String(options.skip))

      const query = params.toString() ? `?${params.toString()}` : ''
      return api.get<UsuariosResponse>(`/api/usuarios${query}`)
    },
  })
}
