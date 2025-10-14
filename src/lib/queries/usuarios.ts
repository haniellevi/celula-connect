import { db } from '@/lib/db'
import { PerfilUsuario } from '../../../prisma/generated/client'
import type { Prisma } from '../../../prisma/generated/client'

export interface ListUsuariosOptions {
  perfil?: PerfilUsuario | PerfilUsuario[]
  igrejaId?: string
  includeInactive?: boolean
  search?: string
  take?: number
  skip?: number
  include?: Prisma.UsuarioInclude
}

export async function listUsuarios({
  perfil,
  igrejaId,
  includeInactive = false,
  search,
  take,
  skip,
  include,
}: ListUsuariosOptions = {}) {
  const where: Prisma.UsuarioWhereInput = {}

  if (perfil) {
    if (Array.isArray(perfil)) {
      where.perfil = { in: perfil }
    } else {
      where.perfil = perfil
    }
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

  return db.usuario.findMany({
    where,
    orderBy: [{ igrejaId: 'asc' }, { nome: 'asc' }],
    include,
    take,
    skip,
  })
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
