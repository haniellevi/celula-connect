import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listAvisos, createAviso } from '@/lib/queries/avisos'
import {
  TipoAviso,
  PrioridadeAviso,
  PerfilUsuario,
  Prisma,
} from '../../../../prisma/generated/client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'

const listQuerySchema = z.object({
  igrejaId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  celulaId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  usuarioId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  tipo: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toUpperCase()
      if (!(normalized in TipoAviso)) {
        throw new Error('Tipo de aviso inválido')
      }
      return TipoAviso[normalized as keyof typeof TipoAviso]
    }),
  prioridade: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toUpperCase()
      if (!(normalized in PrioridadeAviso)) {
        throw new Error('Prioridade inválida')
      }
      return PrioridadeAviso[normalized as keyof typeof PrioridadeAviso]
    }),
  ativos: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? true : value === 'true')),
  referencia: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Data de referência inválida')
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
  includeIgreja: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeCelula: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeUsuario: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
})

const createSchema = z.object({
  titulo: z.string().trim().min(1).max(200),
  conteudo: z.string().trim().min(1),
  tipo: z.nativeEnum(TipoAviso),
  prioridade: z.nativeEnum(PrioridadeAviso).default(PrioridadeAviso.NORMAL),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable().optional(),
  igrejaId: z.string().trim().min(1).optional(),
  celulaId: z.string().trim().min(1).optional(),
  usuarioId: z.string().trim().min(1).optional(),
  ativo: z.boolean().optional(),
})

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

  const {
    igrejaId,
    celulaId,
    usuarioId,
    tipo,
    prioridade,
    ativos,
    referencia,
    take,
    skip,
    includeIgreja,
    includeCelula,
    includeUsuario,
  } = parseResult.data

  const avisos = await listAvisos({
    igrejaId,
    celulaId,
    usuarioId,
    tipo,
    prioridade,
    ativos,
    referencia,
    take,
    skip,
    include: {
      igreja: includeIgreja ?? false,
      celula: includeCelula ?? false,
      usuario: includeUsuario ?? false,
    },
  })

  return NextResponse.json({
    data: avisos,
    meta: {
      count: avisos.length,
      hasMore: typeof take === 'number' ? avisos.length === take : false,
    },
  })
}

const MANAGE_AVISO_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function handlePost(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_AVISO_ROLES)) {
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
  const data: Prisma.AvisoUncheckedCreateInput = {
    titulo: payload.titulo,
    conteudo: payload.conteudo,
    tipo: payload.tipo,
    prioridade: payload.prioridade ?? PrioridadeAviso.NORMAL,
    dataInicio: payload.dataInicio,
    ativo: payload.ativo ?? true,
  }

  if (payload.dataFim !== undefined) {
    data.dataFim = payload.dataFim ?? null
  }
  if (payload.igrejaId) {
    data.igrejaId = payload.igrejaId
  } else if (user.igrejaId) {
    data.igrejaId = user.igrejaId
  }
  if (payload.celulaId) {
    data.celulaId = payload.celulaId
  }
  if (payload.usuarioId) {
    data.usuarioId = payload.usuarioId
  } else {
    data.usuarioId = user.id
  }

  const created = await createAviso(data, {
    igreja: true,
    celula: true,
    usuario: true,
  })

  return NextResponse.json({ success: true, data: created }, { status: 201 })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/avisos',
  feature: 'avisos',
})

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/avisos',
  feature: 'avisos',
})
