import { db } from '@/lib/db'
import type {
  Prisma,
  PrioridadeAviso,
  TipoAviso,
} from '../../../prisma/generated/client'

type AvisoIncludeRelations = {
  igreja?: boolean
  celula?: boolean
  usuario?: boolean
}

export interface ListAvisosOptions {
  igrejaId?: string | null
  celulaId?: string | null
  usuarioId?: string | null
  tipo?: TipoAviso
  prioridade?: PrioridadeAviso
  ativos?: boolean
  referencia?: Date
  take?: number
  skip?: number
  include?: AvisoIncludeRelations
}

export async function listAvisos({
  igrejaId,
  celulaId,
  usuarioId,
  tipo,
  prioridade,
  ativos = true,
  referencia = new Date(),
  take,
  skip,
  include,
}: ListAvisosOptions = {}) {
  const where: Prisma.AvisoWhereInput = {}

  if (igrejaId !== undefined) where.igrejaId = igrejaId
  if (celulaId !== undefined) where.celulaId = celulaId
  if (usuarioId !== undefined) where.usuarioId = usuarioId
  if (tipo) where.tipo = tipo
  if (prioridade) where.prioridade = prioridade

  if (ativos) {
    where.ativo = true
    where.OR = [
      { dataFim: null },
      { dataFim: { gte: referencia } },
    ]
    where.dataInicio = { lte: referencia }
  }

  return db.aviso.findMany({
    where,
    orderBy: [
      { prioridade: 'desc' },
      { dataInicio: 'desc' },
    ],
    include: {
      igreja: include?.igreja ?? false,
      celula: include?.celula ?? false,
      usuario: include?.usuario ?? false,
    },
    take,
    skip,
  })
}

export async function getAvisoById(
  id: string,
  include: AvisoIncludeRelations = {},
) {
  return db.aviso.findUnique({
    where: { id },
    include,
  })
}

export async function createAviso(
  data: Prisma.AvisoUncheckedCreateInput,
  include: AvisoIncludeRelations = {},
) {
  return db.aviso.create({
    data,
    include,
  })
}

export async function updateAviso(
  id: string,
  data: Prisma.AvisoUncheckedUpdateInput,
  include: AvisoIncludeRelations = {},
) {
  return db.aviso.update({
    where: { id },
    data,
    include,
  })
}

export async function deleteAviso(id: string) {
  return db.aviso.delete({
    where: { id },
  })
}
