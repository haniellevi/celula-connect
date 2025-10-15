import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  getDevocionalById,
  updateDevocional,
  deleteDevocional,
} from '@/lib/queries/devocionais'
import {
  PerfilUsuario,
  Prisma,
} from '../../../../../prisma/generated/client'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { adaptRouteWithParams } from '@/lib/api/params'

const updateSchema = z.object({
  titulo: z.string().trim().min(1).max(200).optional(),
  versiculoReferencia: z.string().trim().min(1).max(200).optional(),
  versiculoTexto: z.string().trim().min(1).optional(),
  conteudo: z.string().trim().min(1).optional(),
  dataDevocional: z.coerce.date().optional(),
  ativo: z.boolean().optional(),
})

const MANAGE_DEVOCIONAL_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.LIDER_CELULA,
]

async function handleGet(_request: Request, params: { id: string }) {
  const devocional = await getDevocionalById(params.id)
  if (!devocional) {
    return NextResponse.json({ error: 'Devocional não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data: devocional })
}

async function handlePatch(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_DEVOCIONAL_ROLES)) {
    return unauthorizedResponse()
  }

  const existing = await getDevocionalById(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Devocional não encontrado' }, { status: 404 })
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
  const data: Prisma.DevocionalUncheckedUpdateInput = {}

  if (payload.titulo !== undefined) data.titulo = payload.titulo
  if (payload.versiculoReferencia !== undefined) data.versiculoReferencia = payload.versiculoReferencia
  if (payload.versiculoTexto !== undefined) data.versiculoTexto = payload.versiculoTexto
  if (payload.conteudo !== undefined) data.conteudo = payload.conteudo
  if (payload.dataDevocional !== undefined) data.dataDevocional = payload.dataDevocional
  if (payload.ativo !== undefined) data.ativo = payload.ativo

  try {
    const updated = await updateDevocional(existing.id, data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um devocional para esta data' },
        { status: 409 },
      )
    }

    console.error('PATCH /api/devocionais/[id] error', error)
    return NextResponse.json({ error: 'Erro ao atualizar devocional' }, { status: 500 })
  }
}

async function handleDelete(_request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_DEVOCIONAL_ROLES)) {
    return unauthorizedResponse()
  }

  const existing = await getDevocionalById(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Devocional não encontrado' }, { status: 404 })
  }

  await deleteDevocional(existing.id)

  return NextResponse.json({ success: true })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ params, request }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/devocionais/[id]',
    feature: 'devocionais',
  },
)

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ params, request }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/devocionais/[id]',
    feature: 'devocionais',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ params, request }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/devocionais/[id]',
    feature: 'devocionais',
  },
)
