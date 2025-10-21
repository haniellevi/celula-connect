import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PerfilUsuario,
  StatusSolicitacao,
} from '@/lib/prisma-client'
import { withApiLogging } from '@/lib/logging/api'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { listSolicitacoesTrilha } from '@/lib/queries/trilhas'

const querySchema = z.object({
  trilhaId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  areaSupervisaoId: z.string().optional(),
  usuarioId: z.string().optional(),
  liderSolicitanteId: z.string().optional(),
  supervisorResponsavelId: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toUpperCase()
      if (!(normalized in StatusSolicitacao)) {
        throw new Error('Status inválido')
      }
      return StatusSolicitacao[normalized as keyof typeof StatusSolicitacao]
    }),
  scope: z.enum(['mine', 'lider', 'pendentes', 'all']).optional(),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
  includeUsuario: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeTrilha: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeArea: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeLider: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeSupervisor: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
})

const ALLOWED_ROLES: PerfilUsuario[] = [
  PerfilUsuario.DISCIPULO,
  PerfilUsuario.LIDER_CELULA,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.PASTOR,
]

async function handleGet(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, ALLOWED_ROLES)) {
    return unauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const {
    trilhaId,
    areaSupervisaoId,
    usuarioId,
    liderSolicitanteId,
    supervisorResponsavelId,
    status,
    scope,
    take,
    skip,
    includeUsuario,
    includeTrilha,
    includeArea,
    includeLider,
    includeSupervisor,
  } = parseResult.data

  const filters: {
    trilhaId?: string
    areaSupervisaoId?: string
    usuarioId?: string
    liderSolicitanteId?: string
    supervisorResponsavelId?: string
    status?: StatusSolicitacao
  } = {}

  if (trilhaId) filters.trilhaId = trilhaId
  if (areaSupervisaoId) filters.areaSupervisaoId = areaSupervisaoId
  if (usuarioId) filters.usuarioId = usuarioId
  if (liderSolicitanteId) filters.liderSolicitanteId = liderSolicitanteId
  if (supervisorResponsavelId) filters.supervisorResponsavelId = supervisorResponsavelId
  if (status) filters.status = status

  switch (user.perfil) {
    case PerfilUsuario.DISCIPULO:
      filters.usuarioId = user.id
      break
    case PerfilUsuario.LIDER_CELULA:
      filters.liderSolicitanteId = user.id
      break
    case PerfilUsuario.SUPERVISOR:
      if (
        !filters.areaSupervisaoId &&
        !filters.supervisorResponsavelId &&
        scope !== 'all' &&
        scope !== 'pendentes'
      ) {
        filters.supervisorResponsavelId = user.id
      }
      break
    default:
      break
  }

  if (scope === 'mine') {
    filters.usuarioId = user.id
  } else if (scope === 'lider') {
    filters.liderSolicitanteId = user.id
  } else if (scope === 'pendentes') {
    filters.status = StatusSolicitacao.PENDENTE
  }

  const solicitacoes = await listSolicitacoesTrilha({
    ...filters,
    take,
    skip,
    include: {
      usuario: includeUsuario ?? true,
      trilha: includeTrilha ?? true,
      area: includeArea ?? true,
      lider: includeLider ?? true,
      supervisor: includeSupervisor ?? true,
    },
  })

  return NextResponse.json({
    data: solicitacoes,
    meta: {
      count: solicitacoes.length,
      hasMore: typeof take === 'number' ? solicitacoes.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/trilhas/solicitacoes',
  feature: 'trilhas',
})
