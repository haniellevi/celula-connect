import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  listDevocionais,
  createDevocional,
} from '@/lib/queries/devocionais'
import {
  PerfilUsuario,
  Prisma,
} from '../../../../prisma/generated/client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'

const listQuerySchema = z.object({
  ativos: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? true : value === 'true')),
  dataInicial: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Data inicial inválida')
      }
      return parsed
    }),
  dataFinal: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Data final inválida')
      }
      return parsed
    }),
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
  titulo: z.string().trim().min(1).max(200),
  versiculoReferencia: z.string().trim().min(1).max(200),
  versiculoTexto: z.string().trim().min(1),
  conteudo: z.string().trim().min(1),
  dataDevocional: z.coerce.date(),
  ativo: z.boolean().optional(),
})

const MANAGE_DEVOCIONAL_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function handleGet(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = listQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { ativos, dataInicial, dataFinal, take, skip } = parseResult.data

  const devocionais = await listDevocionais({
    ativos,
    dataInicial,
    dataFinal,
    take,
    skip,
  })

  return NextResponse.json({
    data: devocionais,
    meta: {
      count: devocionais.length,
      hasMore: typeof take === 'number' ? devocionais.length === take : false,
    },
  })
}

async function handlePost(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_DEVOCIONAL_ROLES)) {
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

  try {
    const created = await createDevocional({
      titulo: payload.titulo,
      versiculoReferencia: payload.versiculoReferencia,
      versiculoTexto: payload.versiculoTexto,
      conteudo: payload.conteudo,
      dataDevocional: payload.dataDevocional,
      ativo: payload.ativo ?? true,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um devocional para esta data' },
        { status: 409 },
      )
    }

    console.error('POST /api/devocionais error', error)
    return NextResponse.json({ error: 'Erro ao criar devocional' }, { status: 500 })
  }
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/devocionais',
  feature: 'devocionais',
})

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/devocionais',
  feature: 'devocionais',
})
