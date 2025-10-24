import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  countCelulas,
  createCelula,
  getCelulaById,
  listCelulas,
  type CelulaOrderField,
} from '@/lib/queries/celulas'

const celulaOrderableFields = ['nome', 'createdAt', 'proximaReuniao', 'metaMembros'] as const

const listQuerySchema = z.object({
  igrejaId: z.string().optional(),
  liderId: z.string().optional(),
  supervisorId: z.string().optional(),
  redeId: z.string().optional(),
  ativa: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (value === 'true') return true
      if (value === 'false') return false
      return undefined
    }),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return undefined
      return Math.max(1, Math.floor(parsed))
    }),
  pageSize: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return undefined
      return Math.min(100, Math.max(1, Math.floor(parsed)))
    }),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
  includeMembers: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  orderBy: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toLowerCase()
      const match = celulaOrderableFields.find((field) => field.toLowerCase() === normalized)
      return match as CelulaOrderField | undefined
    }),
  orderDirection: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toLowerCase()
      if (normalized === 'asc' || normalized === 'desc') {
        return normalized as 'asc' | 'desc'
      }
      return undefined
    }),
})

const createCelulaSchema = z.object({
  nome: z.string().trim().min(1),
  igrejaId: z.string().trim().min(1),
  liderId: z.string().trim().min(1),
  supervisorId: z.string().trim().min(1).nullable().optional(),
  diaSemana: z.string().trim().min(1),
  horario: z.string().trim().min(1),
  endereco: z.string().trim().max(255).nullable().optional(),
  metaMembros: z.coerce.number().int().positive().max(999).optional(),
  ativa: z.boolean().optional(),
  dataInauguracao: z.coerce.date().optional(),
  proximaReuniao: z.coerce.date().optional(),
})

async function handleGet(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = listQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.flatten() }, { status: 400 })
  }

  const {
    igrejaId,
    liderId,
    supervisorId,
    redeId,
    ativa,
    search,
    page,
    pageSize,
    take,
    skip,
    includeMembers,
    orderBy,
    orderDirection,
  } = parseResult.data

  const resolvedTake = take ?? pageSize ?? 20
  const resolvedSkip = skip ?? ((page ?? 1) - 1) * resolvedTake
  const resolvedPage =
    page ?? (resolvedTake > 0 ? Math.floor(resolvedSkip / resolvedTake) + 1 : 1)

  const [celulas, totalCount] = await Promise.all([
    listCelulas({
      igrejaId,
      liderId,
      supervisorId,
      redeId,
      ativa,
      search,
      take: resolvedTake,
      skip: resolvedSkip,
      orderBy,
      orderDirection,
      include: {
        igreja: true,
        lider: true,
        supervisor: true,
        membros: includeMembers ? { include: { usuario: true } } : undefined,
      },
    }),
    countCelulas({
      igrejaId,
      liderId,
      supervisorId,
      redeId,
      ativa,
      search,
    }),
  ])

  const resolvedPageSize = resolvedTake
  const pageCount =
    resolvedPageSize > 0 ? Math.max(1, Math.ceil(totalCount / resolvedPageSize)) : 1
  const hasMore = resolvedSkip + celulas.length < totalCount

  return NextResponse.json({
    data: celulas,
    meta: {
      count: celulas.length,
      totalCount,
      page: resolvedPage,
      pageSize: resolvedPageSize,
      pageCount,
      hasMore,
      orderBy: orderBy ?? null,
      orderDirection: orderDirection ?? 'asc',
    },
  })
}

async function handlePost(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parseResult = createCelulaSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
  }

  const payload = parseResult.data

  const data: Parameters<typeof createCelula>[0] = {
    nome: payload.nome,
    igrejaId: payload.igrejaId,
    liderId: payload.liderId,
    supervisorId: payload.supervisorId ?? undefined,
    diaSemana: payload.diaSemana,
    horario: payload.horario,
    endereco: payload.endereco ?? undefined,
    metaMembros: payload.metaMembros ?? 12,
    ativa: payload.ativa ?? true,
    dataInauguracao: payload.dataInauguracao,
    proximaReuniao: payload.proximaReuniao,
  }

  const created = await createCelula(data)
  const expanded = await getCelulaById(created.id)

  return NextResponse.json(expanded ?? created, { status: 201 })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/celulas',
  feature: 'celulas',
})

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/celulas',
  feature: 'celulas',
})
