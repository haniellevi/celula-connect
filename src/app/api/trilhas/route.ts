"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser } from '@/lib/domain-auth'
import { listTrilhasCrescimento } from '@/lib/queries/trilhas'

const querySchema = z.object({
  search: z.string().optional(),
  ativa: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (value === 'true') return true
      if (value === 'false') return false
      return undefined
    }),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
  includeUsuarios: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  includeAreas: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
})

async function handleGet(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { search, ativa, take, skip, includeUsuarios, includeAreas } = parseResult.data

  const trilhas = await listTrilhasCrescimento({
    search,
    ativa,
    take,
    skip,
    includeUsuarios: includeUsuarios ?? true,
    includeAreas: includeAreas ?? true,
  })

  return NextResponse.json({
    data: trilhas,
    meta: {
      count: trilhas.length,
      hasMore: typeof take === 'number' ? trilhas.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/trilhas',
  feature: 'trilhas',
})
