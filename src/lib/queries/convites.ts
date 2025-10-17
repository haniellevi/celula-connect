import { db } from '@/lib/db'
import type { Prisma } from '../../../prisma/generated/client'

export type ConviteIncludeRelations = {
  celula?: boolean
  convidadoPor?: boolean
  usadoPor?: boolean
}

export interface ListConvitesOptions {
  celulaId?: string
  convidadoPorId?: string
  usado?: boolean
  take?: number
  skip?: number
  include?: ConviteIncludeRelations
}

export async function listConvites({
  celulaId,
  convidadoPorId,
  usado,
  take,
  skip,
  include,
}: ListConvitesOptions = {}) {
  const where: Prisma.ConviteWhereInput = {}

  if (celulaId) where.celulaId = celulaId
  if (convidadoPorId) where.convidadoPorId = convidadoPorId
  if (typeof usado === 'boolean') where.usado = usado

  return db.convite.findMany({
    where,
    orderBy: [
      { usado: 'asc' },
      { dataExpiracao: 'asc' },
    ],
    include: {
      celula: include?.celula ?? false,
      convidadoPor: include?.convidadoPor ?? false,
      usadoPor: include?.usadoPor ?? false,
    },
    take,
    skip,
  })
}

export async function getConviteById(
  id: string,
  include: ConviteIncludeRelations = {},
) {
  return db.convite.findUnique({
    where: { id },
    include,
  })
}

export async function getConviteByToken(
  token: string,
  include: ConviteIncludeRelations = {},
) {
  return db.convite.findUnique({
    where: { tokenConvite: token },
    include,
  })
}

export async function createConvite(
  data: Prisma.ConviteUncheckedCreateInput,
  include: ConviteIncludeRelations = {},
) {
  return db.convite.create({
    data,
    include,
  })
}

export async function updateConvite(
  id: string,
  data: Prisma.ConviteUncheckedUpdateInput,
  include: ConviteIncludeRelations = {},
) {
  return db.convite.update({
    where: { id },
    data,
    include,
  })
}

export async function markConviteUsado(
  token: string,
  usadoPorId: string | null,
) {
  return db.convite.update({
    where: { tokenConvite: token },
    data: {
      usado: true,
      usadoPorId,
      updatedAt: new Date(),
    },
  })
}

export async function deleteConvite(id: string) {
  return db.convite.delete({
    where: { id },
  })
}

export async function registerConviteView(
  token: string,
  status: 'valid' | 'expired' | 'used',
) {
  const data: Prisma.ConviteUpdateInput = {
    totalVisualizacoes: { increment: 1 },
    ultimaVisualizacaoEm: new Date(),
  }

  if (status === 'valid') {
    data.totalAcessosValidos = { increment: 1 }
  }

  return db.convite.update({
    where: { tokenConvite: token },
    data,
  })
}
