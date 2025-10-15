import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  listConfiguracoesSistema,
  upsertConfiguracaoSistemaEntry,
  deleteConfiguracaoSistemaEntry,
} from '@/lib/queries/settings'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
} from '@/lib/domain-auth'
import { PerfilUsuario } from '../../../../../prisma/generated/client'

const querySchema = z.object({
  categoria: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
})

const upsertSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().min(1),
  categoria: z.string().trim().min(1),
  descricao: z.string().trim().max(255).nullable().optional(),
  tipoCampo: z.string().trim().min(1).optional(),
})

const deleteSchema = z.object({
  key: z.string().trim().min(1),
})

const MANAGE_SYSTEM_CONFIG_ROLES: PerfilUsuario[] = [PerfilUsuario.PASTOR]

async function ensureAuthorized() {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return { response: authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { user } = authResult
  if (!hasRole(user, MANAGE_SYSTEM_CONFIG_ROLES)) {
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

  const { categoria } = parseResult.data
  const configuracoes = await listConfiguracoesSistema(categoria)

  return NextResponse.json({
    data: configuracoes,
    meta: { count: configuracoes.length },
  })
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
  const entry = await upsertConfiguracaoSistemaEntry({
    chave: payload.key,
    valor: payload.value,
    categoria: payload.categoria,
    descricao: payload.descricao ?? null,
    tipoCampo: payload.tipoCampo,
  })

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
  await deleteConfiguracaoSistemaEntry(payload.key)

  return NextResponse.json({ success: true })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/admin/configuracoes',
  feature: 'system_config_admin',
})

export const PUT = withApiLogging(handlePut, {
  method: 'PUT',
  route: '/api/admin/configuracoes',
  feature: 'system_config_admin',
})

export const DELETE = withApiLogging(handleDelete, {
  method: 'DELETE',
  route: '/api/admin/configuracoes',
  feature: 'system_config_admin',
})
