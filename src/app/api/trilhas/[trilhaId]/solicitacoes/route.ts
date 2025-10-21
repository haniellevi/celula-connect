import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PerfilUsuario,
  StatusSolicitacao,
  Prisma,
} from '@/lib/prisma-client'
import { withApiLogging } from '@/lib/logging/api'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { adaptRouteWithParams } from '@/lib/api/params'
import { createSolicitacaoTrilha } from '@/lib/queries/trilhas'
import { notifyTrilhaSolicitacaoCreated } from '@/lib/services/trilha-notifications'

const createSolicitacaoSchema = z.object({
  usuarioId: z.string().trim().min(1).optional(),
  areaSupervisaoId: z.string().trim().min(1, 'Área de supervisão é obrigatória'),
  liderSolicitanteId: z.string().trim().min(1, 'Líder solicitante é obrigatório').optional(),
  motivo: z.string().trim().min(1).max(500, 'Motivo deve ter no máximo 500 caracteres'),
  observacoesLider: z.string().trim().max(500).optional(),
})

const SOLICITACAO_ROLES: PerfilUsuario[] = [
  PerfilUsuario.DISCIPULO,
  PerfilUsuario.LIDER_CELULA,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.PASTOR,
]

async function handlePost(request: Request, params: { trilhaId: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = authResult
  if (!hasRole(user, SOLICITACAO_ROLES)) {
    return unauthorizedResponse()
  }

  const body = await request.json().catch(() => null)
  const parseResult = createSolicitacaoSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const trilhaId = params.trilhaId
  if (!trilhaId) {
    return NextResponse.json({ error: 'Trilha não especificada' }, { status: 400 })
  }

  const usuarioId = payload.usuarioId ?? user.id
  if (user.perfil === PerfilUsuario.DISCIPULO && usuarioId !== user.id) {
    return unauthorizedResponse()
  }

  let liderSolicitanteId = payload.liderSolicitanteId
  if (!liderSolicitanteId) {
    if (user.perfil === PerfilUsuario.LIDER_CELULA || user.perfil === PerfilUsuario.PASTOR) {
      liderSolicitanteId = user.id
    } else {
      return NextResponse.json(
        { error: 'Líder solicitante é obrigatório para este perfil' },
        { status: 400 },
      )
    }
  }

  const data: Prisma.SolicitacaoAvancoTrilhaUncheckedCreateInput = {
    usuarioId,
    trilhaId,
    areaSupervisaoId: payload.areaSupervisaoId,
    liderSolicitanteId,
    motivo: payload.motivo,
    observacoesLider: payload.observacoesLider ?? null,
    status: StatusSolicitacao.PENDENTE,
    dataSolicitacao: new Date(),
  }

  const created = await createSolicitacaoTrilha(data, {
    usuario: true,
    trilha: true,
    liderSolicitante: true,
    area: true,
    supervisorResponsavel: true,
  })

  void notifyTrilhaSolicitacaoCreated(created)

  return NextResponse.json({ success: true, data: created }, { status: 201 })
}

export const POST = withApiLogging(
  adaptRouteWithParams<{ trilhaId: string }>(({ params, request }) => handlePost(request, params)),
  {
    method: 'POST',
    route: '/api/trilhas/[trilhaId]/solicitacoes',
    feature: 'trilhas',
  },
)
