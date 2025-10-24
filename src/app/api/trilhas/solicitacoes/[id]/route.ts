import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PerfilUsuario, StatusSolicitacao } from '@/lib/prisma-client'
import { withApiLogging } from '@/lib/logging/api'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { adaptRouteWithParams } from '@/lib/api/params'
import {
  getSolicitacaoTrilhaById,
  updateSolicitacaoTrilha,
} from '@/lib/queries/trilhas'
import { notifyTrilhaSolicitacaoStatusChanged } from '@/lib/services/trilha-notifications'

const updateSchema = z.object({
  status: z.nativeEnum(StatusSolicitacao).optional(),
  observacoesSupervisor: z.string().trim().max(500).optional(),
  observacoesLider: z.string().trim().max(500).optional(),
  motivo: z.string().trim().max(500).optional(),
  areaSupervisaoId: z.string().trim().min(1).optional(),
  supervisorResponsavelId: z.string().trim().min(1).optional(),
})

const REVIEW_ROLES: PerfilUsuario[] = [
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.PASTOR,
]

async function handlePatch(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, REVIEW_ROLES)) {
    return unauthorizedResponse()
  }

  const solicitacaoId = params.id
  if (!solicitacaoId) {
    return NextResponse.json({ error: 'ID da solicitação é obrigatório' }, { status: 400 })
  }

  const current = await getSolicitacaoTrilhaById(solicitacaoId, {
    usuario: true,
    trilha: true,
    liderSolicitante: true,
    area: true,
    supervisorResponsavel: true,
  })
  if (!current) {
    return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
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
  const data: Parameters<typeof updateSolicitacaoTrilha>[1] = {}

  if (payload.status) {
    data.status = payload.status
    data.dataResposta =
      payload.status === StatusSolicitacao.PENDENTE ? null : new Date()
    data.supervisorResponsavelId =
      payload.supervisorResponsavelId ?? user.id
  } else if (payload.supervisorResponsavelId) {
    data.supervisorResponsavelId = payload.supervisorResponsavelId
  }

  if (payload.observacoesSupervisor !== undefined) {
    data.observacoesSupervisor = payload.observacoesSupervisor ?? null
  }

  if (payload.observacoesLider !== undefined) {
    data.observacoesLider = payload.observacoesLider ?? null
  }

  if (payload.motivo !== undefined) {
    data.motivo = payload.motivo ?? null
  }

  if (payload.areaSupervisaoId !== undefined) {
    data.areaSupervisaoId = payload.areaSupervisaoId
  }

  const statusChanged =
    payload.status !== undefined && payload.status !== current.status

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'Nenhum campo válido informado para atualização' },
      { status: 400 },
    )
  }

  const updated = await updateSolicitacaoTrilha(solicitacaoId, data, {
    usuario: true,
    trilha: true,
    liderSolicitante: true,
    area: true,
    supervisorResponsavel: true,
  })

  if (statusChanged) {
    void notifyTrilhaSolicitacaoStatusChanged(updated)
  }

  return NextResponse.json({ success: true, data: updated })
}

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ params, request }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/trilhas/solicitacoes/[id]',
    feature: 'trilhas',
  },
)
