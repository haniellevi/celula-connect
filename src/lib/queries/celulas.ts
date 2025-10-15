import { db } from '@/lib/db'
import type { Prisma } from '../../../prisma/generated/client'

type CelulaIncludeRelations = {
  igreja?: boolean
  lider?: boolean
  supervisor?: boolean
  membros?: boolean | {
    include?: {
      usuario?: boolean
    }
  }
  reunioes?: boolean
}

export interface ListCelulasOptions {
  igrejaId?: string
  liderId?: string
  supervisorId?: string
  redeId?: string
  ativa?: boolean
  search?: string
  include?: CelulaIncludeRelations
  take?: number
  skip?: number
  orderBy?: CelulaOrderField
  orderDirection?: Prisma.SortOrder
}

export type CelulaOrderField = 'nome' | 'createdAt' | 'proximaReuniao' | 'metaMembros'

type CelulaFilterOptions = {
  igrejaId?: string
  liderId?: string
  supervisorId?: string
  redeId?: string
  ativa?: boolean
  search?: string
}

function buildCelulaWhere({
  igrejaId,
  liderId,
  supervisorId,
  redeId,
  ativa,
  search,
}: CelulaFilterOptions = {}): Prisma.CelulaWhereInput {
  const where: Prisma.CelulaWhereInput = {}

  if (igrejaId) where.igrejaId = igrejaId
  if (liderId) where.liderId = liderId
  if (supervisorId) where.supervisorId = supervisorId
  if (redeId) where.redeId = redeId
  if (typeof ativa === 'boolean') where.ativa = ativa

  if (search) {
    where.nome = { contains: search, mode: 'insensitive' }
  }

  return where
}

export async function listCelulas({
  igrejaId,
  liderId,
  supervisorId,
  redeId,
  ativa,
  search,
  include,
  take,
  skip,
  orderBy,
  orderDirection,
}: ListCelulasOptions = {}) {
  const where = buildCelulaWhere({ igrejaId, liderId, supervisorId, redeId, ativa, search })
  const direction: Prisma.SortOrder = orderDirection ?? 'asc'
  const orderByClause: Prisma.CelulaOrderByWithRelationInput[] = orderBy
    ? [{ [orderBy]: direction } as Prisma.CelulaOrderByWithRelationInput]
    : [{ igrejaId: 'asc' }, { nome: 'asc' }]

  return db.celula.findMany({
    where,
    orderBy: orderByClause,
    include,
    take,
    skip,
  })
}

type CountCelulasOptions = CelulaFilterOptions

export async function countCelulas({
  igrejaId,
  liderId,
  supervisorId,
  redeId,
  ativa,
  search,
}: CountCelulasOptions = {}) {
  const where = buildCelulaWhere({ igrejaId, liderId, supervisorId, redeId, ativa, search })
  return db.celula.count({ where })
}

export async function getCelulaById(
  id: string,
  include: CelulaIncludeRelations = {
    igreja: true,
    lider: true,
    supervisor: true,
    membros: { include: { usuario: true } },
    reunioes: true,
  },
) {
  return db.celula.findUnique({
    where: { id },
    include,
  })
}

export async function createCelula(
  data: Prisma.CelulaUncheckedCreateInput,
) {
  return db.celula.create({
    data,
  })
}

export async function updateCelula(
  id: string,
  data: Prisma.CelulaUncheckedUpdateInput,
  include: CelulaIncludeRelations = {
    igreja: true,
    lider: true,
    supervisor: true,
    membros: { include: { usuario: true } },
    reunioes: true,
  },
) {
  return db.celula.update({
    where: { id },
    data,
    include,
  })
}

export async function deleteCelula(id: string) {
  return db.celula.delete({
    where: { id },
  })
}
