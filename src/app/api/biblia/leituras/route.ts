"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser } from '@/lib/domain-auth'
import { db } from '@/lib/db'
import type { Prisma } from '@/lib/prisma-client'

const bodySchema = z.object({
  livroCodigo: z.string().trim().min(1, 'Código do livro é obrigatório'),
  capitulo: z.coerce.number().int().positive().max(150, 'Capítulo inválido'),
  dataLeitura: z.string().datetime().optional(),
  tempoLeitura: z.coerce.number().int().positive().max(600).optional(),
  observacoes: z.string().trim().max(500).optional(),
  metaId: z.string().trim().min(1).optional(),
})

async function handlePost(request: Request) {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { user } = authResult

  const body = await request.json().catch(() => null)
  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parseResult.data
  const dataLeitura = payload.dataLeitura ? new Date(payload.dataLeitura) : new Date()
  const tempoLeitura = payload.tempoLeitura ?? null

  const livro = await db.livroBiblia.findFirst({
    where: { codigo: payload.livroCodigo },
    select: { codigo: true, nome: true },
  })
  if (!livro) {
    return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 })
  }

  const metaUsuario = payload.metaId
    ? await db.metaLeituraUsuario.findFirst({
        where: {
          metaId: payload.metaId,
          usuarioId: user.id,
          ativa: true,
        },
        include: {
          meta: true,
        },
      })
    : null

  if (payload.metaId && !metaUsuario) {
    return NextResponse.json(
      { error: 'Meta de leitura não atribuída ao usuário' },
      { status: 404 },
    )
  }

  const outcome = await db.$transaction(async (tx: any) => {
    const leitura = await tx.leituraRegistro.create({
      data: {
        usuarioId: user.id,
        livroCodigo: livro.codigo,
        capitulo: payload.capitulo,
        dataLeitura,
        tempoLeitura,
        observacoes: payload.observacoes,
        metaId: payload.metaId ?? null,
      },
    })

    if (!metaUsuario) {
      return { leitura, metaUsuario: null }
    }

    const meta = metaUsuario.meta
    const novoProgresso = Math.min(meta.valorMeta, metaUsuario.progressoAtual + 1)
    const percentual = meta.valorMeta
      ? Math.min(100, Number(((novoProgresso / meta.valorMeta) * 100).toFixed(2)))
      : 100

    await tx.progressoAutomaticoMeta.create({
      data: {
        metaUsuarioId: metaUsuario.id,
        livroCodigo: livro.codigo,
        capitulo: payload.capitulo,
        dataLeitura,
        tempoLeitura: tempoLeitura ?? 0,
        percentualConcluido: percentual,
        contribuiuMeta: true,
      },
    })

    const metaUsuarioAtualizado = await tx.metaLeituraUsuario.update({
      where: { id: metaUsuario.id },
      data: {
        progressoAtual: novoProgresso,
        ultimaAtualizacao: new Date(),
      },
      include: {
        meta: true,
        progressoAutomatico: true,
      },
    })

    return { leitura, metaUsuario: metaUsuarioAtualizado }
  })

  return NextResponse.json(
    {
      success: true,
      data: {
        leitura: outcome.leitura,
        metaUsuario: outcome.metaUsuario,
      },
    },
    { status: 201 },
  )
}

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/biblia/leituras',
  feature: 'biblia',
})
