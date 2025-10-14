import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listUsuarios } from '@/lib/queries/usuarios'
import { PerfilUsuario } from '../../../../prisma/generated/client'

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

  const { perfil, igrejaId, includeInactive, search, take, skip, includeIgreja } = parseResult.data

  const usuarios = await listUsuarios({
    perfil: perfil && perfil.length === 1 ? perfil[0] : perfil,
    igrejaId,
    includeInactive,
    search,
    take,
    skip,
    include: includeIgreja ? { igreja: true } : undefined,
  })

  return NextResponse.json({
    data: usuarios,
    meta: {
      count: usuarios.length,
      hasMore: typeof take === 'number' ? usuarios.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/usuarios',
  feature: 'usuarios',
})
