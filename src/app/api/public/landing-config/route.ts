import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listLandingPageConfig } from '@/lib/queries/settings'

const querySchema = z.object({
  section: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
})

async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { section } = parseResult.data
  const config = await listLandingPageConfig(section)

  return NextResponse.json({
    data: config,
    meta: {
      count: config.length,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/public/landing-config',
  feature: 'landing_config_public',
})
