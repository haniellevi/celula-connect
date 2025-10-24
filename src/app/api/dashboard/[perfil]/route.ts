import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PerfilUsuario,
  StatusSolicitacao,
} from '@/lib/prisma-client'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser, hasRole } from '@/lib/domain-auth'
import { db } from '@/lib/db'

const paramsSchema = z.object({
  perfil: z.enum(['pastor', 'supervisor', 'lider', 'discipulo']),
})

async function getPastorStats() {
  const [totalIgrejas, totalCelulas, totalDiscipulos, totalLideres, totalSupervisores, solicitacoesPendentes, convitesPendentes] =
    await Promise.all([
      db.igreja.count(),
      db.celula.count(),
      db.usuario.count({ where: { perfil: PerfilUsuario.DISCIPULO } }),
      db.usuario.count({ where: { perfil: PerfilUsuario.LIDER_CELULA } }),
      db.usuario.count({ where: { perfil: PerfilUsuario.SUPERVISOR } }),
      db.solicitacaoAvancoTrilha.count({ where: { status: StatusSolicitacao.PENDENTE } }),
      db.convite.count({ where: { usado: false } }),
    ])

  return {
    totalIgrejas,
    totalCelulas,
    totalDiscipulos,
    totalLideres,
    totalSupervisores,
    solicitacoesPendentes,
    convitesPendentes,
  }
}

async function getLiderStats(userId: string) {
  const [celulas, solicitacoesPendentes] = await Promise.all([
    db.celula.findMany({
      where: { liderId: userId },
      select: {
        id: true,
        membros: { select: { ativo: true } },
        convites: { select: { usado: true } },
      },
    }),
    db.solicitacaoAvancoTrilha.count({
      where: {
        liderSolicitanteId: userId,
        status: StatusSolicitacao.PENDENTE,
      },
    }),
  ])

  const totalCelulas = celulas.length
  const membrosAtivos = celulas.reduce<number>(
    (acc: number, celula: { membros: { ativo: boolean }[] }) =>
      acc + celula.membros.filter((membro: { ativo: boolean }) => membro.ativo).length,
    0,
  )
  const convitesPendentes = celulas.reduce<number>(
    (acc: number, celula: { convites: { usado: boolean }[] }) =>
      acc + celula.convites.filter((convite: { usado: boolean }) => !convite.usado).length,
    0,
  )

  return {
    totalCelulas,
    membrosAtivos,
    convitesPendentes,
    solicitacoesPendentes,
  }
}

async function getSupervisorStats(userId: string) {
  const [celulas, solicitacoesPendentes, convitesPendentes] = await Promise.all([
    db.celula.findMany({
      where: { supervisorId: userId },
      select: {
        id: true,
        membros: { select: { ativo: true } },
        reunioes: { select: { presentes: true } },
      },
    }),
    db.solicitacaoAvancoTrilha.count({
      where: {
        status: StatusSolicitacao.PENDENTE,
        OR: [
          { area: { supervisorId: userId } },
          { supervisorResponsavelId: userId },
        ],
      },
    }),
    db.convite.count({
      where: {
        usado: false,
        celula: { supervisorId: userId },
      },
    }),
  ])

  const totalCelulas = celulas.length
  const membrosAtivos = celulas.reduce<number>(
    (acc: number, celula: { membros: { ativo: boolean }[] }) =>
      acc + celula.membros.filter((membro: { ativo: boolean }) => membro.ativo).length,
    0,
  )
  const reunioes = celulas.flatMap((celula: { reunioes: { presentes: number | null }[] }) => celula.reunioes)
  const mediaPresenca = reunioes.length
    ? Math.round(
        reunioes.reduce<number>(
          (acc: number, reuniao: { presentes: number | null }) => acc + (reuniao.presentes ?? 0),
          0,
        ) / reunioes.length,
      )
    : 0

  return {
    totalCelulas,
    membrosAtivos,
    mediaPresenca,
    convitesPendentes,
    solicitacoesPendentes,
  }
}

async function handleGet(_request: Request, params: { perfil: string }) {
  const parseResult = paramsSchema.safeParse(params)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 })
  }

  const { perfil } = parseResult.data
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  let stats: Record<string, number> = {}

  if (perfil === 'pastor') {
    if (!hasRole(user, [PerfilUsuario.PASTOR])) {
      return NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 })
    }
    stats = await getPastorStats()
  } else if (perfil === 'lider') {
    if (!hasRole(user, [PerfilUsuario.LIDER_CELULA, PerfilUsuario.SUPERVISOR, PerfilUsuario.PASTOR])) {
      return NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 })
    }
    stats = await getLiderStats(user.id)
  } else if (perfil === 'supervisor') {
    if (!hasRole(user, [PerfilUsuario.SUPERVISOR, PerfilUsuario.PASTOR])) {
      return NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 })
    }
    stats = await getSupervisorStats(user.id)
  } else {
    return NextResponse.json({ error: 'Perfil não suportado neste endpoint' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      perfil,
      stats,
      generatedAt: new Date().toISOString(),
    },
  })
}

export const GET = withApiLogging(
  (_req, ctx) => handleGet(_req, ctx.params as { perfil: string }),
  {
    method: 'GET',
    route: '/api/dashboard/[perfil]',
    feature: 'dashboard_summary',
  },
)
