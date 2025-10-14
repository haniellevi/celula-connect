import { db } from '@/lib/db'
import type { Prisma } from '../../../prisma/generated/client'

export interface ListConvitesOptions {
  celulaId?: string
  convidadoPorId?: string
  usado?: boolean
  take?: number
  skip?: number
  include?: {
    celula?: boolean
    convidadoPor?: boolean
    usadoPor?: boolean
  }
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

export async function getConviteByToken(token: string) {
  return db.convite.findUnique({
    where: { tokenConvite: token },
  })
}
