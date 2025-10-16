import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  listLandingPageConfig,
  upsertLandingPageConfigEntry,
  deleteLandingPageConfigEntry,
} from '@/lib/queries/settings'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { PerfilUsuario } from '../../../../../prisma/generated/client'
import { revalidateMarketingSnapshots } from '@/lib/cache/revalidate-marketing'

const querySchema = z.object({
  section: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
})

const upsertSchema = z.object({
  section: z.string().trim().min(1),
  key: z.string().trim().min(1),
  value: z.string().min(1),
  type: z.string().trim().min(1).optional(),
})

const deleteSchema = z.object({
  section: z.string().trim().min(1),
  key: z.string().trim().min(1),
})

const MANAGE_LANDING_CONFIG_ROLES: PerfilUsuario[] = [
  PerfilUsuario.PASTOR,
  PerfilUsuario.SUPERVISOR,
]

async function ensureAuthorized() {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return { response: authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_LANDING_CONFIG_ROLES)) {
    return { response: unauthorizedResponse() }
  }

  return { user }
}

async function handleGet(request: Request) {
  const auth = await ensureAuthorized()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { section } = parseResult.data
  const entries = await listLandingPageConfig(section)
  return NextResponse.json({ data: entries, meta: { count: entries.length } })
}

async function handlePut(request: Request) {
  const auth = await ensureAuthorized()
  if ('response' in auth) return auth.response

  const body = await request.json().catch(() => null)
  const parseResult = upsertSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const entry = await upsertLandingPageConfigEntry({
    secao: payload.section,
    chave: payload.key,
    valor: payload.value,
    tipo: payload.type,
  })

  await revalidateMarketingSnapshots()

  return NextResponse.json({ success: true, data: entry })
}

async function handleDelete(request: Request) {
  const auth = await ensureAuthorized()
  if ('response' in auth) return auth.response

  const body = await request.json().catch(() => null)
  const parseResult = deleteSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  await deleteLandingPageConfigEntry(payload.section, payload.key)
  await revalidateMarketingSnapshots()
  return NextResponse.json({ success: true })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/admin/landing-config',
  feature: 'landing_config_admin',
})

export const PUT = withApiLogging(handlePut, {
  method: 'PUT',
  route: '/api/admin/landing-config',
  feature: 'landing_config_admin',
})

export const DELETE = withApiLogging(handleDelete, {
  method: 'DELETE',
  route: '/api/admin/landing-config',
  feature: 'landing_config_admin',
})
