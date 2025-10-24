import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  listConvites,
  createConvite,
  getConviteByToken,
} from '@/lib/queries/convites'
import { getCelulaById } from '@/lib/queries/celulas'
import { PerfilUsuario, CargoCelula } from '@/lib/prisma-client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'

const listQuerySchema = z.object({
  celulaId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  convidadoPorId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  usado: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeCelula: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeConvidadoPor: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeUsadoPor: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
})

const createSchema = z.object({
  celulaId: z.string().trim().min(1),
  emailConvidado: z.string().trim().email(),
  nomeConvidado: z.string().trim().min(1).max(200),
  cargo: z.nativeEnum(CargoCelula).optional(),
  dataExpiracao: z.coerce.date().optional(),
})

const MANAGE_CONVITE_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function ensureUserCanManageCelula(user: {
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
    return NextResponse.json({ error: 'Célula não encontrada' }, { status: 404 })
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

async function generateUniqueToken() {
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const token = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
    const existing = await getConviteByToken(token)
    if (!existing) return token
  }
  throw new Error('Não foi possível gerar um token de convite único')
}

async function handleGet(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const { searchParams } = new URL(request.url)
  const parseResult = listQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const {
    celulaId,
    convidadoPorId,
    usado,
    includeCelula,
    includeConvidadoPor,
    includeUsadoPor,
    take,
    skip,
  } = parseResult.data

  const filters: {
    celulaId?: string
    convidadoPorId?: string
  } = {}

  if (!hasRole(user, MANAGE_CONVITE_ROLES)) {
    return unauthorizedResponse()
  }

  if (celulaId) {
    const unauthorized = await ensureUserCanManageCelula(user, celulaId)
    if (unauthorized) return unauthorized
    filters.celulaId = celulaId
  } else if (user.perfil === PerfilUsuario.LIDER_CELULA) {
    filters.convidadoPorId = user.id
  } else if (convidadoPorId) {
    filters.convidadoPorId = convidadoPorId
  }

  const convites = await listConvites({
    ...filters,
    usado,
    take,
    skip,
    include: {
      celula: includeCelula ?? false,
      convidadoPor: includeConvidadoPor ?? false,
      usadoPor: includeUsadoPor ?? false,
    },
  })

  return NextResponse.json({
    data: convites,
    meta: {
      count: convites.length,
      hasMore: typeof take === 'number' ? convites.length === take : false,
    },
  })
}

async function handlePost(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  if (!hasRole(user, MANAGE_CONVITE_ROLES)) {
    return unauthorizedResponse()
  }

  const body = await request.json().catch(() => null)
  const parseResult = createSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const unauthorized = await ensureUserCanManageCelula(user, payload.celulaId)
  if (unauthorized) return unauthorized

  const expiracao = payload.dataExpiracao ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)

  try {
    const token = await generateUniqueToken()
    const convite = await createConvite(
      {
        celulaId: payload.celulaId,
        convidadoPorId: user.id,
        emailConvidado: payload.emailConvidado,
        nomeConvidado: payload.nomeConvidado,
        cargo: payload.cargo ?? CargoCelula.MEMBRO,
        tokenConvite: token,
        dataExpiracao: expiracao,
      },
      {
        celula: true,
        convidadoPor: true,
      },
    )

    return NextResponse.json({ success: true, data: convite }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um convite gerado com este token' },
        { status: 409 },
      )
    }

    console.error('POST /api/convites error', error)
    return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
  }
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/convites',
  feature: 'convites',
})

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/convites',
  feature: 'convites',
})
