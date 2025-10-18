import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { countUsuarios, listUsuarios, type UsuarioOrderField } from '@/lib/queries/usuarios'
import { PerfilUsuario } from '@/lib/prisma-client'

const usuarioOrderableFields = ['nome', 'createdAt', 'ultimoAcesso', 'perfil'] as const

const querySchema = z.object({
  perfil: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((item) => item.trim().toUpperCase())
            .filter((item): item is keyof typeof PerfilUsuario => item in PerfilUsuario)
            .map((item) => PerfilUsuario[item])
        : undefined,
    ),
  igrejaId: z.string().optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return undefined
      return Math.max(1, Math.floor(parsed))
    }),
  pageSize: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return undefined
      return Math.min(100, Math.max(1, Math.floor(parsed)))
    }),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
  includeIgreja: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  orderBy: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toLowerCase()
      const match = usuarioOrderableFields.find((field) => field.toLowerCase() === normalized)
      return match as UsuarioOrderField | undefined
    }),
  orderDirection: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const normalized = value.trim().toLowerCase()
      if (normalized === 'asc' || normalized === 'desc') {
        return normalized as 'asc' | 'desc'
      }
      return undefined
    }),
})

async function handleGet(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.flatten() }, { status: 400 })
  }

  const {
    perfil,
    igrejaId,
    includeInactive,
    search,
    page,
    pageSize,
    take,
    skip,
    includeIgreja,
    orderBy,
    orderDirection,
  } = parseResult.data

  const resolvedTake = take ?? pageSize ?? 20
  const resolvedSkip = skip ?? ((page ?? 1) - 1) * resolvedTake
  const resolvedPage =
    page ?? (resolvedTake > 0 ? Math.floor(resolvedSkip / resolvedTake) + 1 : 1)

  const [usuarios, totalCount] = await Promise.all([
    listUsuarios({
      perfil: perfil && perfil.length === 1 ? perfil[0] : perfil,
      igrejaId,
      includeInactive,
      search,
      take: resolvedTake,
      skip: resolvedSkip,
      include: includeIgreja ? { igreja: true } : undefined,
      orderBy,
      orderDirection,
    }),
    countUsuarios({
      perfil: perfil && perfil.length === 1 ? perfil[0] : perfil,
      igrejaId,
      includeInactive,
      search,
    }),
  ])

  const resolvedPageSize = resolvedTake
  const pageCount =
    resolvedPageSize > 0 ? Math.max(1, Math.ceil(totalCount / resolvedPageSize)) : 1
  const hasMore = resolvedSkip + usuarios.length < totalCount

  return NextResponse.json({
    data: usuarios,
    meta: {
      count: usuarios.length,
      totalCount,
      page: resolvedPage,
      pageSize: resolvedPageSize,
      pageCount,
      hasMore,
      orderBy: orderBy ?? null,
      orderDirection: orderDirection ?? 'asc',
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/usuarios',
  feature: 'usuarios',
})
