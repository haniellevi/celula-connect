import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  getConviteByToken,
  updateConvite,
  deleteConvite,
} from '@/lib/queries/convites'
import { getCelulaById } from '@/lib/queries/celulas'
import {
  PerfilUsuario,
  CargoCelula,
  Prisma,
} from '@/lib/prisma-client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { adaptRouteWithParams } from '@/lib/api/params'

const includeSchema = z.object({
  includeCelula: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeConvidadoPor: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
})

const updateSchema = z.object({
  nomeConvidado: z.string().trim().min(1).max(200).optional(),
  emailConvidado: z.string().trim().email().optional(),
  cargo: z.nativeEnum(CargoCelula).optional(),
  usado: z.boolean().optional(),
  usadoPorId: z.string().trim().min(1).nullable().optional(),
  dataExpiracao: z.coerce.date().optional(),
})

const MANAGE_CONVITE_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function ensureUserCanManageConvite(user: {
  id: string
  perfil: PerfilUsuario
  igrejaId: string | null
}, celulaId: string) {
  const celula = await getCelulaById(celulaId, {
    igreja: true,
    lider: true,
    supervisor: true,
  })
  if (!celula) {
    return NextResponse.json({ error: 'Célula do convite não foi encontrada' }, { status: 404 })
  }

  if (user.perfil === PerfilUsuario.PASTOR) {
    if (user.igrejaId && celula.igrejaId !== user.igrejaId) {
      return unauthorizedResponse()
    }
    return null
  }

  if (user.perfil === PerfilUsuario.SUPERVISOR) {
    if (celula.supervisorId !== user.id) {
      return unauthorizedResponse()
    }
    return null
  }

  if (user.perfil === PerfilUsuario.LIDER_CELULA) {
    if (celula.liderId !== user.id) {
      return unauthorizedResponse()
    }
    return null
  }

  return unauthorizedResponse()
}

async function handleGet(request: Request, params: { token: string }) {
  const { searchParams } = new URL(request.url)
  const parseResult = includeSchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { includeCelula, includeConvidadoPor } = parseResult.data
  const convite = await getConviteByToken(
    params.token,
    {
      celula: includeCelula ?? false,
      convidadoPor: includeConvidadoPor ?? false,
    },
  )

  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
  }

  const agora = new Date()
  if (convite.usado) {
    return NextResponse.json({ error: 'Convite já utilizado' }, { status: 410 })
  }
  if (convite.dataExpiracao < agora) {
    return NextResponse.json({ error: 'Convite expirado' }, { status: 410 })
  }

  return NextResponse.json({ data: convite })
}

async function handlePatch(request: Request, params: { token: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  if (!hasRole(user, MANAGE_CONVITE_ROLES)) {
    return unauthorizedResponse()
  }

  const convite = await getConviteByToken(params.token)
  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
  }

  const unauthorized = await ensureUserCanManageConvite(user, convite.celulaId)
  if (unauthorized) return unauthorized

  const body = await request.json().catch(() => null)
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const data: Prisma.ConviteUncheckedUpdateInput = {}

  if (payload.nomeConvidado !== undefined) data.nomeConvidado = payload.nomeConvidado
  if (payload.emailConvidado !== undefined) data.emailConvidado = payload.emailConvidado
  if (payload.cargo !== undefined) data.cargo = payload.cargo
  if (payload.dataExpiracao !== undefined) data.dataExpiracao = payload.dataExpiracao

  if (payload.usado !== undefined) {
    data.usado = payload.usado
    if (payload.usado) {
      data.usadoPorId = payload.usadoPorId ?? user.id
    } else {
      data.usadoPorId = null
    }
  } else if (payload.usadoPorId !== undefined) {
    data.usadoPorId = payload.usadoPorId
  }

  const updated = await updateConvite(convite.id, data, {
    celula: true,
    convidadoPor: true,
    usadoPor: true,
  })

  return NextResponse.json({ success: true, data: updated })
}

async function handleDelete(_request: Request, params: { token: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  if (!hasRole(user, MANAGE_CONVITE_ROLES)) {
    return unauthorizedResponse()
  }

  const convite = await getConviteByToken(params.token)
  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
  }

  const unauthorized = await ensureUserCanManageConvite(user, convite.celulaId)
  if (unauthorized) return unauthorized

  await deleteConvite(convite.id)

  return NextResponse.json({ success: true })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ token: string }>(({ params, request }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/convites/[token]',
    feature: 'convites',
  },
)

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ token: string }>(({ params, request }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/convites/[token]',
    feature: 'convites',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ token: string }>(({ params, request }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/convites/[token]',
    feature: 'convites',
  },
)
