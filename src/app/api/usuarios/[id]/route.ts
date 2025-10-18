import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import {
  requireDomainUser,
  hasRole,
  unauthorizedResponse,
  assertDomainMutationsEnabled,
} from '@/lib/domain-auth'
import { getUsuarioById, updateUsuario } from '@/lib/queries/usuarios'
import { PerfilUsuario } from '@/lib/prisma-client'
import { adaptRouteWithParams } from '@/lib/api/params'

const updateSchema = z.object({
  perfil: z.nativeEnum(PerfilUsuario).optional(),
  ativo: z.boolean().optional(),
  igrejaId: z.string().trim().min(1).nullable().optional(),
})

async function handlePatch(request: Request, params: { id: string }) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  if (!hasRole(user, [PerfilUsuario.PASTOR])) {
    return unauthorizedResponse()
  }

  const usuarioId = params.id
  if (!usuarioId) {
    return NextResponse.json({ error: 'ID de usuário é obrigatório' }, { status: 400 })
  }

  const usuario = await getUsuarioById(usuarioId)
  if (!usuario) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const mutationsEnabled = await assertDomainMutationsEnabled()
  if (!mutationsEnabled) {
    return NextResponse.json(
      { error: 'Mutação de domínio temporariamente desabilitada. Contate o administrador.' },
      { status: 423 },
    )
  }

  const body = await request.json().catch(() => null)
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.flatten() }, { status: 400 })
  }

  const payload = parseResult.data

  const updated = await updateUsuario(usuarioId, {
    ...(payload.perfil !== undefined ? { perfil: payload.perfil } : {}),
    ...(payload.ativo !== undefined ? { ativo: payload.ativo } : {}),
    ...(payload.igrejaId !== undefined ? { igrejaId: payload.igrejaId ?? null } : {}),
  })

  return NextResponse.json({ success: true, data: updated })
}

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/usuarios/[id]',
    feature: 'usuarios',
  },
)
