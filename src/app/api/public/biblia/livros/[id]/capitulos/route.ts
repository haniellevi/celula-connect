"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listCapitulosPorLivro } from '@/lib/queries/biblia'
import { adaptRouteWithParams } from '@/lib/api/params'

const querySchema = z.object({
  includeVersiculos: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(200, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
})

async function handleGet(request: Request, params: { id: string }) {
  const livroId = params.id
  if (!livroId) {
    return NextResponse.json({ error: 'Livro id é obrigatório' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { includeVersiculos, take, skip } = parseResult.data

  const capitulos = await listCapitulosPorLivro(livroId, {
    includeVersiculos,
    take,
    skip,
  })

  return NextResponse.json({
    data: capitulos.map((capitulo: { id: string; numero: number; livroId: string; versiculosBiblia?: { id: string; numero: number; texto: string }[] }) => ({
      id: capitulo.id,
      numero: capitulo.numero,
      livroId: capitulo.livroId,
      versiculos: includeVersiculos
        ? capitulo.versiculosBiblia?.map((versiculo: { id: string; numero: number; texto: string }) => ({
            id: versiculo.id,
            numero: versiculo.numero,
            texto: versiculo.texto,
          })) ?? []
        : undefined,
    })),
    meta: {
      count: capitulos.length,
      hasMore: typeof take === 'number' ? capitulos.length === take : false,
    },
  })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ id: string }>(async ({ request, params }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/public/biblia/livros/[id]/capitulos',
    feature: 'biblia_public',
  },
)
