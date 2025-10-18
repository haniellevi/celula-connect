import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listMetasLeitura } from '@/lib/queries/biblia'
import { requireDomainUser, hasRole } from '@/lib/domain-auth'
import { db } from '@/lib/db'
import { PerfilUsuario, TipoMeta, UnidadeTempo } from '@/lib/prisma-client'

const querySchema = z.object({
  igrejaId: z.string().optional(),
  celulaId: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (value === 'null') return null
      return value
    }),
  ativo: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (value === 'true') return true
      if (value === 'false') return false
      return undefined
    }),
  includeUsuarios: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeLeituras: z
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

async function handleGet(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.flatten() }, { status: 400 })
  }

  const { igrejaId, celulaId, ativo, includeUsuarios, includeLeituras, take, skip } = parseResult.data

  const metas = await listMetasLeitura({
    igrejaId: igrejaId ?? user.igrejaId ?? undefined,
    celulaId: celulaId,
    ativo: ativo ?? true,
    includeUsuarios,
    includeLeituras,
    take,
    skip,
  })

  return NextResponse.json({
    data: metas,
    meta: {
      count: metas.length,
      hasMore: typeof take === 'number' ? metas.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/biblia/metas',
  feature: 'biblia',
})

const createMetaSchema = z.object({
  titulo: z.string().trim().min(3),
  descricao: z.string().trim().max(1000).optional(),
  igrejaId: z.string().trim().min(1),
  celulaId: z.string().trim().min(1).nullable().optional(),
  tipoMeta: z.nativeEnum(TipoMeta),
  valorMeta: z.number().int().positive().max(365),
  unidade: z.nativeEnum(UnidadeTempo),
  periodo: z.string().trim().min(1),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  ativa: z.boolean().optional(),
})

async function handlePost(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult
  if (!hasRole(user, [PerfilUsuario.PASTOR])) {
    return NextResponse.json({ error: 'Apenas pastores podem criar metas' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parseResult = createMetaSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.flatten() }, { status: 400 })
  }

  const payload = parseResult.data

  const createdMeta = await db.metaLeitura.create({
    data: {
      titulo: payload.titulo,
      descricao: payload.descricao,
      igrejaId: payload.igrejaId,
      celulaId: payload.celulaId ?? null,
      tipoMeta: payload.tipoMeta,
      valorMeta: payload.valorMeta,
      unidade: payload.unidade,
      periodo: payload.periodo,
      dataInicio: payload.dataInicio,
      dataFim: payload.dataFim,
      ativa: payload.ativa ?? true,
      criadoPor: user.id,
    },
    include: {
      igreja: true,
      celula: true,
      usuarios: true,
      leituras: true,
    },
  })

  return NextResponse.json({ success: true, data: createdMeta }, { status: 201 })
}

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/biblia/metas',
  feature: 'biblia',
})
