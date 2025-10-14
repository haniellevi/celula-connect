import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listIgrejas } from '@/lib/queries/igrejas'
import { StatusAssinatura } from '../../../../prisma/generated/client'

const querySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((item) => item.trim().toUpperCase())
            .filter((item): item is keyof typeof StatusAssinatura => item in StatusAssinatura)
            .map((item) => StatusAssinatura[item])
        : undefined,
    ),
  search: z.string().optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
  includeCelulas: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includePlano: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
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

  const { status, search, includeInactive, take, skip, includeCelulas, includePlano } = parseResult.data

  const igrejas = await listIgrejas({
    status,
    search,
    includeInactive,
    take,
    skip,
    include: {
      plano: includePlano,
      celulas: includeCelulas ? true : undefined,
    },
  })

  return NextResponse.json({
    data: igrejas,
    meta: {
      count: igrejas.length,
      hasMore: typeof take === 'number' ? igrejas.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/igrejas',
  feature: 'igrejas',
})
