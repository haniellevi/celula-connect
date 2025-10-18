import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { deleteCelula, getCelulaById, updateCelula } from '@/lib/queries/celulas'
import {
  requireDomainUser,
  unauthorizedResponse,
  assertDomainMutationsEnabled,
} from '@/lib/domain-auth'
import { Prisma, PerfilUsuario } from '@/lib/prisma-client'
import { adaptRouteWithParams } from '@/lib/api/params'

const updateSchema = z.object({
  nome: z.string().trim().min(1).max(255).optional(),
  diaSemana: z.string().trim().min(1).max(50).optional(),
  horario: z.string().trim().min(1).max(50).optional(),
  endereco: z.string().trim().max(255).nullable().optional(),
  metaMembros: z.number().int().positive().max(999).optional(),
  liderId: z.string().trim().min(1).nullable().optional(),
  supervisorId: z.string().trim().min(1).nullable().optional(),
  ativa: z.boolean().optional(),
  dataInauguracao: z.coerce.date().nullable().optional(),
  proximaReuniao: z.coerce.date().nullable().optional(),
})

function canManageCelula(userId: string, perfil: PerfilUsuario, celula: { supervisorId: string | null }) {
  if (perfil === PerfilUsuario.PASTOR) return true
  if (perfil === PerfilUsuario.SUPERVISOR && celula.supervisorId === userId) return true
  return false
}

async function handlePut(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const celulaId = params.id
  if (!celulaId) {
    return NextResponse.json({ error: 'ID da célula é obrigatório' }, { status: 400 })
  }

  const celula = await getCelulaById(celulaId)
  if (!celula) {
    return NextResponse.json({ error: 'Célula não encontrada' }, { status: 404 })
  }

  if (!canManageCelula(user.id, user.perfil, celula)) {
    return unauthorizedResponse()
  }

  const mutationsEnabled = await assertDomainMutationsEnabled()
  if (!mutationsEnabled) {
    return NextResponse.json(
      {
        error: 'Mutação de domínio temporariamente desabilitada. Contate o administrador para habilitar.',
      },
      { status: 423 },
    )
  }

  const body = await request.json().catch(() => null)
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.flatten() }, { status: 400 })
  }

  const payload = parseResult.data
  const data: Prisma.CelulaUncheckedUpdateInput = {
    ...(payload.nome !== undefined ? { nome: payload.nome } : {}),
    ...(payload.diaSemana !== undefined ? { diaSemana: payload.diaSemana } : {}),
    ...(payload.horario !== undefined ? { horario: payload.horario } : {}),
    ...(payload.endereco !== undefined ? { endereco: payload.endereco ?? null } : {}),
    ...(payload.metaMembros !== undefined ? { metaMembros: payload.metaMembros } : {}),
    ...(payload.ativa !== undefined ? { ativa: payload.ativa } : {}),
    ...(payload.dataInauguracao !== undefined ? { dataInauguracao: payload.dataInauguracao ?? null } : {}),
    ...(payload.proximaReuniao !== undefined ? { proximaReuniao: payload.proximaReuniao ?? null } : {}),
  }

  if (payload.liderId !== undefined && payload.liderId !== null) {
    data.liderId = payload.liderId
  }
  if (payload.supervisorId !== undefined) {
    data.supervisorId = { set: payload.supervisorId }
  }

  const updated = await updateCelula(celulaId, data)

  return NextResponse.json({ success: true, data: updated })
}

async function handleDelete(_request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const celula = await getCelulaById(params.id)
  if (!celula) {
    return NextResponse.json({ error: 'Célula não encontrada' }, { status: 404 })
  }

  if (!canManageCelula(user.id, user.perfil, celula)) {
    return unauthorizedResponse()
  }

  await deleteCelula(celula.id)
  return NextResponse.json({ success: true })
}

export const PUT = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handlePut(request, params)),
  {
    method: 'PUT',
    route: '/api/celulas/[id]',
    feature: 'celulas',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/celulas/[id]',
    feature: 'celulas',
  },
)
