import { db } from '@/lib/db'
import { StatusAssinatura } from '../../../prisma/generated/client'
import type { Prisma } from '../../../prisma/generated/client'

type IgrejaIncludeRelations = {
  plano?: boolean
  celulas?: boolean
}

export interface ListIgrejasOptions {
  status?: StatusAssinatura[]
  search?: string
  includeInactive?: boolean
  take?: number
  skip?: number
  include?: IgrejaIncludeRelations
}

export async function listIgrejas({
  status,
  search,
  includeInactive = false,
  take,
  skip,
  include,
}: ListIgrejasOptions = {}) {
  const where: Prisma.IgrejaWhereInput = {}

  if (status && status.length > 0) {
    where.statusAssinatura = { in: status }
  } else if (!includeInactive) {
    where.statusAssinatura = {
      in: [StatusAssinatura.TRIAL, StatusAssinatura.ATIVA],
    }
  }

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { cidade: { contains: search, mode: 'insensitive' } },
      { estado: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  return db.igreja.findMany({
    where,
    orderBy: { nome: 'asc' },
    include,
    take,
    skip,
  })
}

export async function getIgrejaById(
  id: string,
  include: IgrejaIncludeRelations = { plano: true, celulas: true },
) {
  return db.igreja.findUnique({
    where: { id },
    include,
  })
}

export async function updateIgreja(
  id: string,
  data: Prisma.IgrejaUpdateInput,
  include: IgrejaIncludeRelations = { plano: true, celulas: true },
) {
  return db.igreja.update({
    where: { id },
    data,
    include,
  })
}

export async function deleteIgreja(id: string) {
  return db.igreja.delete({
    where: { id },
  })
}
