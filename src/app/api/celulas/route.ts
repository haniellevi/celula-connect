import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { createCelula, getCelulaById, listCelulas } from '@/lib/queries/celulas'
import type { Prisma } from '../../../../prisma/generated/client'

const listQuerySchema = z.object({
  igrejaId: z.string().optional(),
  liderId: z.string().optional(),
  supervisorId: z.string().optional(),
  search: z.string().optional(),
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

  const { igrejaId, liderId, supervisorId, search, take, skip, includeMembers } = parseResult.data

  const celulas = await listCelulas({
    igrejaId,
    liderId,
    supervisorId,
    search,
    take,
    skip,
    include: {
      igreja: true,
      lider: true,
      supervisor: true,
      membros: includeMembers ? { include: { usuario: true } } : undefined,
    },
  })

  return NextResponse.json({
    data: celulas,
    meta: {
      count: celulas.length,
      hasMore: typeof take === 'number' ? celulas.length === take : false,
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

  const data: Prisma.CelulaUncheckedCreateInput = {
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
