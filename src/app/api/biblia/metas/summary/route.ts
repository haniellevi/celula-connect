"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser } from '@/lib/domain-auth'
import { getMetasLeituraSummary } from '@/lib/queries/biblia'

const querySchema = z.object({
  igrejaId: z.string().optional(),
  celulaId: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (value === 'null') return null
      return value
    }),
  rangeDays: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return undefined
      return Math.round(parsed)
    }),
})

async function handleGet(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { igrejaId, celulaId, rangeDays } = parseResult.data

  const summary = await getMetasLeituraSummary({
    igrejaId: igrejaId ?? user.igrejaId ?? undefined,
    celulaId,
    rangeDays,
  })

  return NextResponse.json({ data: summary })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/biblia/metas/summary',
  feature: 'biblia',
})
