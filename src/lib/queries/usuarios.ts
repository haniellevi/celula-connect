import { db } from '@/lib/db'
import { PerfilUsuario } from '@/lib/prisma-client'
import type { Prisma } from '@/lib/prisma-client'

export type UsuarioOrderField = 'nome' | 'createdAt' | 'ultimoAcesso' | 'perfil'

type UsuarioFilterOptions = {
  perfil?: PerfilUsuario | PerfilUsuario[]
  igrejaId?: string
  includeInactive?: boolean
  search?: string
}

export interface ListUsuariosOptions {
  perfil?: PerfilUsuario | PerfilUsuario[]
  igrejaId?: string
  includeInactive?: boolean
  search?: string
  take?: number
  skip?: number
  include?: Prisma.UsuarioInclude
  orderBy?: UsuarioOrderField
  orderDirection?: Prisma.SortOrder
}

type CountUsuariosOptions = UsuarioFilterOptions

function buildUsuarioWhere({
  perfil,
  igrejaId,
  includeInactive = false,
  search,
}: UsuarioFilterOptions = {}): Prisma.UsuarioWhereInput {
  const where: Prisma.UsuarioWhereInput = {}

  if (perfil) {
    where.perfil = Array.isArray(perfil) ? { in: perfil } : perfil
  }
  if (igrejaId) where.igrejaId = igrejaId
  if (!includeInactive) where.ativo = true

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { telefone: { contains: search, mode: 'insensitive' } },
    ]
  }

  return where
}

export async function listUsuarios({
  perfil,
  igrejaId,
  includeInactive = false,
  search,
  take,
  skip,
  include,
  orderBy,
  orderDirection,
}: ListUsuariosOptions = {}) {
  const where = buildUsuarioWhere({ perfil, igrejaId, includeInactive, search })

  const direction: Prisma.SortOrder = orderDirection ?? 'asc'
  const orderByClause: Prisma.UsuarioOrderByWithRelationInput[] = orderBy
    ? [{ [orderBy]: direction } as Prisma.UsuarioOrderByWithRelationInput]
    : [{ igrejaId: 'asc' }, { nome: 'asc' }]

  return db.usuario.findMany({
    where,
    orderBy: orderByClause,
    include,
    take,
    skip,
  })
}

export async function countUsuarios({
  perfil,
  igrejaId,
  includeInactive = false,
  search,
}: CountUsuariosOptions = {}) {
  const where = buildUsuarioWhere({ perfil, igrejaId, includeInactive, search })
  return db.usuario.count({ where })
}

export async function getUsuarioById(
  id: string,
  include?: Prisma.UsuarioInclude,
) {
  return db.usuario.findUnique({
    where: { id },
    include,
  })
}

export async function updateUsuario(
  id: string,
  data: Prisma.UsuarioUpdateInput,
  include?: Prisma.UsuarioInclude,
) {
  return db.usuario.update({
    where: { id },
    data,
    include,
  })
}
