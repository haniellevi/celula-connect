import { db } from '@/lib/db'
import type { Prisma, Testamento } from '../../../prisma/generated/client'

export interface ListLivrosBibliaOptions {
  testamento?: Testamento
  search?: string
  take?: number
  skip?: number
}

export async function listLivrosBiblia({
  testamento,
  search,
  take,
  skip,
}: ListLivrosBibliaOptions = {}) {
  const where: Prisma.LivroBibliaWhereInput = {}

  if (testamento) {
    where.testamento = testamento
  }

  if (search) {
    const normalized = search.trim()
    where.OR = [
      { nome: { contains: normalized, mode: 'insensitive' } },
      { codigo: { contains: normalized, mode: 'insensitive' } },
      { abreviacao: { contains: normalized, mode: 'insensitive' } },
    ]
  }

  return db.livroBiblia.findMany({
    where,
    orderBy: { ordem: 'asc' },
    take,
    skip,
  })
}

export interface ListCapitulosPorLivroOptions {
  includeVersiculos?: boolean
  take?: number
  skip?: number
}

export async function listCapitulosPorLivro(
  livroId: string,
  {
    includeVersiculos = false,
    take,
    skip,
  }: ListCapitulosPorLivroOptions = {},
) {
  return db.capituloBiblia.findMany({
    where: { livroId },
    orderBy: { numero: 'asc' },
    include: includeVersiculos ? { versiculosBiblia: { orderBy: { numero: 'asc' } } } : undefined,
    take,
    skip,
  })
}

export async function getCapituloComVersiculos(id: string) {
  return db.capituloBiblia.findUnique({
    where: { id },
    include: {
      livro: true,
      versiculosBiblia: {
        orderBy: { numero: 'asc' },
      },
    },
  })
}

export interface ListMetasLeituraOptions {
  igrejaId?: string
  celulaId?: string | null
  ativo?: boolean
  includeUsuarios?: boolean
  includeLeituras?: boolean
  take?: number
  skip?: number
}

export async function listMetasLeitura({
  igrejaId,
  celulaId,
  ativo = true,
  includeUsuarios = false,
  includeLeituras = false,
  take,
  skip,
}: ListMetasLeituraOptions = {}) {
  const where: Prisma.MetaLeituraWhereInput = {}

  if (igrejaId) where.igrejaId = igrejaId
  if (celulaId !== undefined) where.celulaId = celulaId
  if (typeof ativo === 'boolean') where.ativa = ativo

  return db.metaLeitura.findMany({
    where,
    orderBy: [{ dataInicio: 'desc' }, { titulo: 'asc' }],
    include: {
      usuarios: includeUsuarios
        ? {
            include: {
              usuario: true,
              progressoAutomatico: true,
            },
          }
        : undefined,
      leituras: includeLeituras ? { orderBy: { dataLeitura: 'desc' } } : undefined,
    },
    take,
    skip,
  })
}

export interface ListMetasUsuarioOptions {
  ativoOnly?: boolean
  includeMeta?: boolean
  includeProgresso?: boolean
  take?: number
  skip?: number
}

export async function listMetasUsuario(
  usuarioId: string,
  {
    ativoOnly = true,
    includeMeta = true,
    includeProgresso = true,
    take,
    skip,
  }: ListMetasUsuarioOptions = {},
) {
  return db.metaLeituraUsuario.findMany({
    where: {
      usuarioId,
      ...(ativoOnly ? { ativa: true } : {}),
    },
    orderBy: { ultimaAtualizacao: 'desc' },
    include: {
      meta: includeMeta
        ? {
            include: {
              igreja: true,
              celula: true,
            },
          }
        : undefined,
      progressoAutomatico: includeProgresso ? { orderBy: { dataLeitura: 'desc' } } : undefined,
    },
    take,
    skip,
  })
}

export interface ListLeiturasUsuarioOptions {
  order?: 'asc' | 'desc'
  take?: number
  skip?: number
}

export async function listLeiturasPorUsuario(
  usuarioId: string,
  { order = 'desc', take, skip }: ListLeiturasUsuarioOptions = {},
) {
  return db.leituraRegistro.findMany({
    where: { usuarioId },
    orderBy: { dataLeitura: order },
    include: {
      meta: true,
    },
    take,
    skip,
  })
}
