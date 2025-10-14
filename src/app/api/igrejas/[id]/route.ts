import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { deleteIgreja, getIgrejaById, updateIgreja } from '@/lib/queries/igrejas'
import { requireDomainUser, hasRole, unauthorizedResponse } from '@/lib/domain-auth'
import { PerfilUsuario, StatusAssinatura } from '../../../../../prisma/generated/client'
import { adaptRouteWithParams } from '@/lib/api/params'

const updateSchema = z.object({
  nome: z.string().trim().min(1).max(255).optional(),
  cidade: z.string().trim().min(1).max(255).optional(),
  estado: z.string().trim().min(1).max(255).optional(),
  telefone: z.string().trim().max(50).nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  observacoesAdmin: z.string().trim().max(1000).nullable().optional(),
  planoId: z.string().trim().min(1).nullable().optional(),
  statusAssinatura: z.nativeEnum(StatusAssinatura).optional(),
})

async function handlePut(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult
  if (!hasRole(user, [PerfilUsuario.PASTOR])) {
    return unauthorizedResponse()
  }

  const igrejaId = params.id
  if (!igrejaId) {
    return NextResponse.json({ error: 'ID da igreja é obrigatório' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.flatten() }, { status: 400 })
  }

  const data = parseResult.data

  const updated = await updateIgreja(igrejaId, {
    ...(data.nome !== undefined ? { nome: data.nome } : {}),
    ...(data.cidade !== undefined ? { cidade: data.cidade } : {}),
    ...(data.estado !== undefined ? { estado: data.estado } : {}),
    ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
    ...(data.email !== undefined ? { email: data.email } : {}),
    ...(data.observacoesAdmin !== undefined ? { observacoesAdmin: data.observacoesAdmin ?? null } : {}),
    ...(data.planoId !== undefined ? { planoId: data.planoId ?? null } : {}),
    ...(data.statusAssinatura !== undefined ? { statusAssinatura: data.statusAssinatura } : {}),
  })

  return NextResponse.json({ success: true, data: updated })
}

async function handleDelete(_request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult
  if (!hasRole(user, [PerfilUsuario.PASTOR])) {
    return unauthorizedResponse()
  }

  const igreja = await getIgrejaById(params.id)
  if (!igreja) {
    return NextResponse.json({ error: 'Igreja não encontrada' }, { status: 404 })
  }

  await deleteIgreja(igreja.id)
  return NextResponse.json({ success: true })
}

export const PUT = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handlePut(request, params)),
  {
    method: 'PUT',
    route: '/api/igrejas/[id]',
    feature: 'igrejas',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/igrejas/[id]',
    feature: 'igrejas',
  },
)
