import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listLeiturasPorUsuario } from '@/lib/queries/biblia'
import { hasRole, requireDomainUser } from '@/lib/domain-auth'
import { PerfilUsuario } from '../../../../../../../prisma/generated/client'
import { adaptRouteWithParams } from '@/lib/api/params'

const querySchema = z.object({
  order: z
    .string()
    .optional()
    .transform((value) => (value === 'asc' || value === 'desc' ? value : undefined)),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
})

async function handleGet(request: Request, params: { usuarioId: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const rawUsuarioId = params.usuarioId
  if (!rawUsuarioId) {
    return NextResponse.json({ error: 'Usuário alvo é obrigatório' }, { status: 400 })
  }

  const targetUserId = rawUsuarioId === 'me' ? user.id : rawUsuarioId

  if (!(user.id === targetUserId || hasRole(user, [PerfilUsuario.SUPERVISOR, PerfilUsuario.PASTOR]))) {
    return NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.flatten() }, { status: 400 })
  }

  const { order, take, skip } = parseResult.data

  const leituras = await listLeiturasPorUsuario(targetUserId, {
    order,
    take,
    skip,
  })

  return NextResponse.json({
    data: leituras,
    meta: {
      count: leituras.length,
      hasMore: typeof take === 'number' ? leituras.length === take : false,
    },
  })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ usuarioId: string }>(({ request, params }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/biblia/leituras/usuarios/[usuarioId]',
    feature: 'biblia',
  },
)
