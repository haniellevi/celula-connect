"use server"

import {
  PrioridadeAviso,
  StatusSolicitacao,
  TipoAviso,
  Prisma,
} from '@/lib/prisma-client'
import { createAviso } from '@/lib/queries/avisos'

type SolicitacaoWithRelations = Prisma.SolicitacaoAvancoTrilhaGetPayload<{
  include: {
    usuario: true
    trilha: true
    liderSolicitante: true
    area: true
    supervisorResponsavel: true
  }
}>

function buildExpiryDate(days: number = 7) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  return expires
}

async function createAvisoSafely(data: Prisma.AvisoUncheckedCreateInput) {
  try {
    await createAviso(data)
  } catch (error) {
    console.error('[trilha-notifications] Failed to create aviso', error)
  }
}

export async function notifyTrilhaSolicitacaoCreated(
  solicitacao: SolicitacaoWithRelations,
) {
  const supervisorId = solicitacao.area?.supervisorId
  const agora = new Date()
  const trilhaTitulo = solicitacao.trilha?.titulo ?? 'Trilha de crescimento'
  const discipuloNome = solicitacao.usuario?.nome ?? 'Discípulo(a)'
  const liderNome = solicitacao.liderSolicitante?.nome ?? 'Líder responsável'

  if (supervisorId) {
    await createAvisoSafely({
      titulo: 'Nova solicitação de avanço na trilha',
      conteudo: `${discipuloNome} solicitou avanço na trilha "${trilhaTitulo}". Líder solicitante: ${liderNome}. Motivo: ${
        solicitacao.motivo ?? 'Motivo não informado.'
      }`,
      tipo: TipoAviso.SISTEMA,
      prioridade: PrioridadeAviso.ALTA,
      dataInicio: agora,
      dataFim: buildExpiryDate(),
      igrejaId: solicitacao.area?.igrejaId ?? null,
      usuarioId: supervisorId,
      ativo: true,
    })
  }

  // Confirmação para o líder solicitante
  if (solicitacao.liderSolicitanteId) {
    await createAvisoSafely({
      titulo: 'Solicitação enviada à supervisão',
      conteudo: `O pedido para ${discipuloNome} avançar na trilha "${trilhaTitulo}" foi encaminhado à supervisão. Você receberá um aviso assim que houver decisão.`,
      tipo: TipoAviso.SISTEMA,
      prioridade: PrioridadeAviso.NORMAL,
      dataInicio: agora,
      dataFim: buildExpiryDate(),
      igrejaId: solicitacao.area?.igrejaId ?? null,
      usuarioId: solicitacao.liderSolicitanteId,
      ativo: true,
    })
  }
}

const STATUS_MESSAGES: Record<StatusSolicitacao, { titulo: string; resumo: string }> = {
  [StatusSolicitacao.PENDENTE]: {
    titulo: 'Solicitação reaberta',
    resumo: 'O pedido voltou para o status pendente.',
  },
  [StatusSolicitacao.APROVADA]: {
    titulo: 'Solicitação aprovada',
    resumo: 'A supervisão aprovou o avanço solicitado.',
  },
  [StatusSolicitacao.REJEITADA]: {
    titulo: 'Solicitação rejeitada',
    resumo: 'A supervisão recusou o avanço solicitado.',
  },
}

export async function notifyTrilhaSolicitacaoStatusChanged(
  solicitacao: SolicitacaoWithRelations,
) {
  const agora = new Date()
  const statusInfo = STATUS_MESSAGES[solicitacao.status]
  const trilhaTitulo = solicitacao.trilha?.titulo ?? 'trilha cadastrada'
  const supervisorNome = solicitacao.supervisorResponsavel?.nome ?? 'Supervisão'

  const mensagemBase = `${statusInfo.resumo}\nTrilha: "${trilhaTitulo}"\nResponsável: ${supervisorNome}.`

  const observacao = solicitacao.observacoesSupervisor
    ? `\nObservações: ${solicitacao.observacoesSupervisor}`
    : ''

  const conteudo = `${mensagemBase}${observacao}`

  const destinatarios = new Set<string>()
  if (solicitacao.usuarioId) destinatarios.add(solicitacao.usuarioId)
  if (solicitacao.liderSolicitanteId) destinatarios.add(solicitacao.liderSolicitanteId)

  if (destinatarios.size === 0) return

  await Promise.all(
    Array.from(destinatarios).map((usuarioId) =>
      createAvisoSafely({
        titulo: statusInfo.titulo,
        conteudo,
        tipo: TipoAviso.SISTEMA,
        prioridade:
          solicitacao.status === StatusSolicitacao.REJEITADA
            ? PrioridadeAviso.ALTA
            : PrioridadeAviso.NORMAL,
        dataInicio: agora,
        dataFim: buildExpiryDate(),
        igrejaId: solicitacao.area?.igrejaId ?? null,
        usuarioId,
        ativo: true,
      }),
    ),
  )
}
