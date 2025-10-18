import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  getAvisoById,
  updateAviso,
  deleteAviso,
} from '@/lib/queries/avisos'
import {
  PerfilUsuario,
  PrioridadeAviso,
  TipoAviso,
  Prisma,
} from '@/lib/prisma-client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { adaptRouteWithParams } from '@/lib/api/params'

const includeSchema = z.object({
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

const updateSchema = z.object({
  titulo: z.string().trim().min(1).max(200).optional(),
  conteudo: z.string().trim().min(1).optional(),
  tipo: z.nativeEnum(TipoAviso).optional(),
  prioridade: z.nativeEnum(PrioridadeAviso).optional(),
  igrejaId: z.string().trim().min(1).nullable().optional(),
  celulaId: z.string().trim().min(1).nullable().optional(),
  usuarioId: z.string().trim().min(1).nullable().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().nullable().optional(),
  ativo: z.boolean().optional(),
})

const MANAGE_AVISO_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function handleGet(request: Request, params: { id: string }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = includeSchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { includeIgreja, includeCelula, includeUsuario } = parseResult.data

  const aviso = await getAvisoById(params.id, {
    igreja: includeIgreja ?? false,
    celula: includeCelula ?? false,
    usuario: includeUsuario ?? false,
  })

  if (!aviso) {
    return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data: aviso })
}

async function handlePatch(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_AVISO_ROLES)) {
    return unauthorizedResponse()
  }

  const avisoId = params.id
  if (!avisoId) {
    return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
  }

  const existing = await getAvisoById(avisoId)
  if (!existing) {
    return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const data: Prisma.AvisoUncheckedUpdateInput = {}

  if (payload.titulo !== undefined) data.titulo = payload.titulo
  if (payload.conteudo !== undefined) data.conteudo = payload.conteudo
  if (payload.tipo !== undefined) data.tipo = payload.tipo
  if (payload.prioridade !== undefined) data.prioridade = payload.prioridade
  if (payload.dataInicio !== undefined) data.dataInicio = payload.dataInicio
  if (payload.dataFim !== undefined) data.dataFim = payload.dataFim ?? null
  if (payload.ativo !== undefined) data.ativo = payload.ativo
  if (payload.igrejaId !== undefined) data.igrejaId = payload.igrejaId ?? null
  if (payload.celulaId !== undefined) data.celulaId = payload.celulaId ?? null
  if (payload.usuarioId !== undefined) data.usuarioId = payload.usuarioId ?? null

  const updated = await updateAviso(avisoId, data, {
    igreja: true,
    celula: true,
    usuario: true,
  })

  return NextResponse.json({ success: true, data: updated })
}

async function handleDelete(_request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_AVISO_ROLES)) {
    return unauthorizedResponse()
  }

  const existing = await getAvisoById(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
  }

  await deleteAviso(existing.id)

  return NextResponse.json({ success: true })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/avisos/[id]',
    feature: 'avisos',
  },
)

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/avisos/[id]',
    feature: 'avisos',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/avisos/[id]',
    feature: 'avisos',
  },
)
