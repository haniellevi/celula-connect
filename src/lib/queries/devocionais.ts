import { db } from '@/lib/db'
import type { Prisma } from '../../../prisma/generated/client'

export interface ListDevocionaisOptions {
  ativos?: boolean
  dataInicial?: Date
  dataFinal?: Date
  take?: number
  skip?: number
}

export async function listDevocionais({
  ativos = true,
  dataInicial,
  dataFinal,
  take,
  skip,
}: ListDevocionaisOptions = {}) {
  const where: Prisma.DevocionalWhereInput = {}

  if (ativos) where.ativo = true
  if (dataInicial || dataFinal) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (dataInicial) dateFilter.gte = dataInicial
    if (dataFinal) dateFilter.lte = dataFinal
    where.dataDevocional = dateFilter
  }

  return db.devocional.findMany({
    where,
    orderBy: { dataDevocional: 'asc' },
    take,
    skip,
  })
}

export async function getDevocionalPorData(data: Date) {
  return db.devocional.findFirst({
    where: {
      dataDevocional: {
        equals: data,
      },
    },
  })
}

export async function getDevocionalById(id: string) {
  return db.devocional.findUnique({
    where: { id },
  })
}

export async function createDevocional(data: Prisma.DevocionalCreateInput) {
  return db.devocional.create({
    data,
  })
}

export async function updateDevocional(
  id: string,
  data: Prisma.DevocionalUncheckedUpdateInput,
) {
  return db.devocional.update({
    where: { id },
    data,
  })
}

export async function deleteDevocional(id: string) {
  return db.devocional.delete({
    where: { id },
  })
}
