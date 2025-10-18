import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PerfilUsuario } from '@/lib/prisma-client'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser, hasRole, unauthorizedResponse } from '@/lib/domain-auth'
import {
  listConfiguracoesSistema,
  upsertConfiguracaoSistemaEntry,
} from '@/lib/queries/settings'

const upsertSchema = z.object({
  key: z.string().trim().min(1),
  enabled: z.boolean(),
  descricao: z.string().trim().max(255).optional(),
})

const ADMIN_ROLES: PerfilUsuario[] = [PerfilUsuario.PASTOR]
const PUBLIC_ROLES: PerfilUsuario[] = [
  PerfilUsuario.DISCIPULO,
  PerfilUsuario.LIDER_CELULA,
  PerfilUsuario.SUPERVISOR,
  PerfilUsuario.PASTOR,
]

async function ensureAccess({ allowPublic = false } = {}) {
  const auth = await requireDomainUser()
  if (!auth.user) {
    return { response: auth.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (allowPublic) {
    if (!hasRole(auth.user, PUBLIC_ROLES)) {
      return { response: unauthorizedResponse() }
    }
  } else if (!hasRole(auth.user, ADMIN_ROLES)) {
    return { response: unauthorizedResponse() }
  }

  return { user: auth.user }
}

async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')

  const result = await ensureAccess({ allowPublic: scope === 'public' })
  if ('response' in result) return result.response

  const flags = await listConfiguracoesSistema('feature_flag')
  const data = Object.fromEntries(
    flags.map((flag) => [flag.chave, flag.valor === 'true']),
  )

  return NextResponse.json({ data, meta: { count: Object.keys(data).length } })
}

async function handlePut(request: Request) {
  const result = await ensureAccess()
  if ('response' in result) return result.response

  const body = await request.json().catch(() => null)
  const parseResult = upsertSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  await upsertConfiguracaoSistemaEntry({
    chave: payload.key,
    valor: String(payload.enabled),
    categoria: 'feature_flag',
    descricao: payload.descricao ?? null,
    tipoCampo: 'boolean',
  })

  const flags = await listConfiguracoesSistema('feature_flag')
  const data = Object.fromEntries(flags.map((flag) => [flag.chave, flag.valor === 'true']))

  return NextResponse.json({ success: true, data })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/admin/feature-flags',
  feature: 'admin_feature_flags',
})

export const PUT = withApiLogging(handlePut, {
  method: 'PUT',
  route: '/api/admin/feature-flags',
  feature: 'admin_feature_flags',
})
