import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser, hasRole } from '@/lib/domain-auth'
import { db } from '@/lib/db'
import { PerfilUsuario, TipoMeta, UnidadeTempo } from '../../../../../../prisma/generated/client'
import { adaptRouteWithParams } from '@/lib/api/params'

const metaIdParamSchema = z.object({
  id: z.string().trim().min(1),
})

const updateMetaSchema = z.object({
  titulo: z.string().trim().min(3).optional(),
  descricao: z.string().trim().max(1000).nullable().optional(),
  igrejaId: z.string().trim().min(1).optional(),
  celulaId: z.string().trim().min(1).nullable().optional(),
  tipoMeta: z.nativeEnum(TipoMeta).optional(),
  valorMeta: z.number().int().positive().max(365).optional(),
  unidade: z.nativeEnum(UnidadeTempo).optional(),
  periodo: z.string().trim().min(1).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  ativa: z.boolean().optional(),
})

async function ensurePastor() {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return { user: null, response: authResult.response }
  }
  const { user } = authResult
  if (!hasRole(user, [PerfilUsuario.PASTOR])) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Apenas pastores podem gerenciar metas' }, { status: 403 }),
    }
  }
  return { user, response: null }
}

async function handlePatch(request: Request, params: { id: string }) {
  const result = await ensurePastor()
  if (!result.user) return result.response!

  const paramResult = metaIdParamSchema.safeParse(params)
  if (!paramResult.success) {
    return NextResponse.json({ error: 'Meta id inválido' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const parseResult = updateMetaSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.flatten() }, { status: 400 })
  }

  const updateData = parseResult.data

  const updated = await db.metaLeitura.update({
    where: { id: paramResult.data.id },
    data: {
      ...(updateData.titulo !== undefined ? { titulo: updateData.titulo } : {}),
      ...(updateData.descricao !== undefined ? { descricao: updateData.descricao } : {}),
      ...(updateData.igrejaId !== undefined ? { igrejaId: updateData.igrejaId } : {}),
      ...(updateData.celulaId !== undefined ? { celulaId: updateData.celulaId ?? null } : {}),
      ...(updateData.tipoMeta !== undefined ? { tipoMeta: updateData.tipoMeta } : {}),
      ...(updateData.valorMeta !== undefined ? { valorMeta: updateData.valorMeta } : {}),
      ...(updateData.unidade !== undefined ? { unidade: updateData.unidade } : {}),
      ...(updateData.periodo !== undefined ? { periodo: updateData.periodo } : {}),
      ...(updateData.dataInicio !== undefined ? { dataInicio: updateData.dataInicio } : {}),
      ...(updateData.dataFim !== undefined ? { dataFim: updateData.dataFim } : {}),
      ...(updateData.ativa !== undefined ? { ativa: updateData.ativa } : {}),
    },
    include: {
      igreja: true,
      celula: true,
      usuarios: {
        include: {
          usuario: true,
        },
      },
      leituras: true,
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

async function handleDelete(_request: Request, params: { id: string }) {
  const result = await ensurePastor()
  if (!result.user) return result.response!

  const paramResult = metaIdParamSchema.safeParse(params)
  if (!paramResult.success) {
    return NextResponse.json({ error: 'Meta id inválido' }, { status: 400 })
  }

  await db.metaLeitura.delete({
    where: { id: paramResult.data.id },
  })

  return NextResponse.json({ success: true })
}

export const PATCH = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handlePatch(request, params)),
  {
    method: 'PATCH',
    route: '/api/biblia/metas/[id]',
    feature: 'biblia',
  },
)

export const DELETE = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleDelete(request, params)),
  {
    method: 'DELETE',
    route: '/api/biblia/metas/[id]',
    feature: 'biblia',
  },
)
