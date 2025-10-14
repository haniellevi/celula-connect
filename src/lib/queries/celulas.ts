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
  search?: string
  include?: CelulaIncludeRelations
  take?: number
  skip?: number
}

export async function listCelulas({
  igrejaId,
  liderId,
  supervisorId,
  search,
  include,
  take,
  skip,
}: ListCelulasOptions = {}) {
  const where: Prisma.CelulaWhereInput = {}

  if (igrejaId) where.igrejaId = igrejaId
  if (liderId) where.liderId = liderId
  if (supervisorId) where.supervisorId = supervisorId

  if (search) {
    where.nome = { contains: search, mode: 'insensitive' }
  }

  return db.celula.findMany({
    where,
    orderBy: [{ igrejaId: 'asc' }, { nome: 'asc' }],
    include,
    take,
    skip,
  })
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
