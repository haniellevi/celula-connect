import { db } from '@/lib/db'
import type {
  Prisma,
  StatusSolicitacao,
} from '@/lib/prisma-client'

export interface ListTrilhasOptions {
  ativa?: boolean
  search?: string
  includeUsuarios?: boolean
  includeAreas?: boolean
  take?: number
  skip?: number
}

export async function listTrilhasCrescimento({
  ativa,
  search,
  includeUsuarios = false,
  includeAreas = false,
  take,
  skip,
}: ListTrilhasOptions = {}) {
  const where: Prisma.TrilhaCrescimentoWhereInput = {}

  if (typeof ativa === 'boolean') {
    where.ativa = ativa
  }

  if (search) {
    const normalized = search.trim()
    if (normalized) {
      where.OR = [
        { titulo: { contains: normalized, mode: 'insensitive' } },
        { descricao: { contains: normalized, mode: 'insensitive' } },
      ]
    }
  }

  return db.trilhaCrescimento.findMany({
    where,
    orderBy: [{ ordem: 'asc' }, { titulo: 'asc' }],
    include: {
      usuariosTrilha: includeUsuarios
        ? {
            include: {
              usuario: true,
            },
          }
        : undefined,
      etapasArea: includeAreas
        ? {
            include: {
              area: true,
            },
          }
        : undefined,
    },
    take,
    skip,
  })
}

export async function getTrilhaComRelacionamentos(
  id: string,
  {
    includeUsuarios = true,
    includeAreas = true,
    includeSolicitacoes = false,
  }: {
    includeUsuarios?: boolean
    includeAreas?: boolean
    includeSolicitacoes?: boolean
  } = {},
) {
  return db.trilhaCrescimento.findUnique({
    where: { id },
    include: {
      usuariosTrilha: includeUsuarios
        ? {
            include: {
              usuario: true,
            },
          }
        : undefined,
      etapasArea: includeAreas
        ? {
            include: {
              area: true,
            },
          }
        : undefined,
      solicitacoes: includeSolicitacoes
        ? {
            include: {
              usuario: true,
              liderSolicitante: true,
              area: true,
              supervisorResponsavel: true,
            },
            orderBy: { dataSolicitacao: 'desc' },
          }
        : undefined,
    },
  })
}

export interface ListAreasSupervisaoOptions {
  igrejaId?: string
  supervisorId?: string
  ativa?: boolean
  includeTrilhas?: boolean
  includeSolicitacoes?: boolean
}

export async function listAreasSupervisao({
  igrejaId,
  supervisorId,
  ativa,
  includeTrilhas = false,
  includeSolicitacoes = false,
}: ListAreasSupervisaoOptions = {}) {
  const where: Prisma.AreaSupervisaoTrilhaWhereInput = {}

  if (igrejaId) where.igrejaId = igrejaId
  if (supervisorId) where.supervisorId = supervisorId
  if (typeof ativa === 'boolean') where.ativa = ativa

  return db.areaSupervisaoTrilha.findMany({
    where,
    orderBy: [{ igrejaId: 'asc' }, { nome: 'asc' }],
    include: {
      etapas: includeTrilhas
        ? {
            include: {
              trilha: true,
            },
          }
        : undefined,
      solicitacoes: includeSolicitacoes
        ? {
            include: {
              usuario: true,
              trilha: true,
              liderSolicitante: true,
              supervisorResponsavel: true,
            },
            orderBy: { dataSolicitacao: 'desc' },
          }
        : undefined,
    },
  })
}

export interface ListSolicitacoesTrilhaOptions {
  areaSupervisaoId?: string
  usuarioId?: string
  liderSolicitanteId?: string
  supervisorResponsavelId?: string
  status?: StatusSolicitacao
  trilhaId?: string
  take?: number
  skip?: number
  include?: {
    usuario?: boolean
    trilha?: boolean
    lider?: boolean
    area?: boolean
    supervisor?: boolean
  }
}

export async function listSolicitacoesTrilha({
  areaSupervisaoId,
  usuarioId,
  liderSolicitanteId,
  supervisorResponsavelId,
  status,
  trilhaId,
  take,
  skip,
  include,
}: ListSolicitacoesTrilhaOptions = {}) {
  const where: Prisma.SolicitacaoAvancoTrilhaWhereInput = {}

  if (areaSupervisaoId) where.areaSupervisaoId = areaSupervisaoId
  if (usuarioId) where.usuarioId = usuarioId
  if (liderSolicitanteId) where.liderSolicitanteId = liderSolicitanteId
  if (supervisorResponsavelId) where.supervisorResponsavelId = supervisorResponsavelId
  if (status) where.status = status
  if (trilhaId) where.trilhaId = trilhaId

  return db.solicitacaoAvancoTrilha.findMany({
    where,
    orderBy: { dataSolicitacao: 'desc' },
    include: {
      usuario: include?.usuario ?? true,
      trilha: include?.trilha ?? true,
      liderSolicitante: include?.lider ?? true,
      area: include?.area ?? false,
      supervisorResponsavel: include?.supervisor ?? false,
    },
    take,
    skip,
  })
}

export async function getSolicitacaoTrilhaById(
  id: string,
  include: {
    usuario?: boolean
    trilha?: boolean
    liderSolicitante?: boolean
    area?: boolean
    supervisorResponsavel?: boolean
  } = {},
) {
  return db.solicitacaoAvancoTrilha.findUnique({
    where: { id },
    include: {
      usuario: include.usuario ?? true,
      trilha: include.trilha ?? true,
      liderSolicitante: include.liderSolicitante ?? true,
      area: include.area ?? false,
      supervisorResponsavel: include.supervisorResponsavel ?? false,
    },
  })
}

export async function createSolicitacaoTrilha(
  data: Prisma.SolicitacaoAvancoTrilhaUncheckedCreateInput,
  include: {
    usuario?: boolean
    trilha?: boolean
    liderSolicitante?: boolean
    area?: boolean
    supervisorResponsavel?: boolean
  } = {},
) {
  return db.solicitacaoAvancoTrilha.create({
    data,
    include: {
      usuario: include.usuario ?? true,
      trilha: include.trilha ?? true,
      liderSolicitante: include.liderSolicitante ?? true,
      area: include.area ?? false,
      supervisorResponsavel: include.supervisorResponsavel ?? false,
    },
  })
}

export async function updateSolicitacaoTrilha(
  id: string,
  data: Prisma.SolicitacaoAvancoTrilhaUncheckedUpdateInput,
  include: {
    usuario?: boolean
    trilha?: boolean
    liderSolicitante?: boolean
    area?: boolean
    supervisorResponsavel?: boolean
  } = {},
) {
  return db.solicitacaoAvancoTrilha.update({
    where: { id },
    data,
    include: {
      usuario: include.usuario ?? true,
      trilha: include.trilha ?? true,
      liderSolicitante: include.liderSolicitante ?? true,
      area: include.area ?? false,
      supervisorResponsavel: include.supervisorResponsavel ?? false,
    },
  })
}

export interface ListUsuarioTrilhasOptions {
  usuarioId?: string
  concluido?: boolean
  includeTrilha?: boolean
}

export async function listUsuarioTrilhas({
  usuarioId,
  concluido,
  includeTrilha = true,
}: ListUsuarioTrilhasOptions = {}) {
  const where: Prisma.UsuarioTrilhaWhereInput = {}

  if (usuarioId) where.usuarioId = usuarioId
  if (typeof concluido === 'boolean') where.concluido = concluido

  return db.usuarioTrilha.findMany({
    where,
    orderBy: [{ concluido: 'asc' }, { updatedAt: 'desc' }],
    include: {
      trilha: includeTrilha,
      usuario: true,
    },
  })
}
