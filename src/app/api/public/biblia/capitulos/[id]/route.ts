"use server";

import { NextResponse } from 'next/server'
import { withApiLogging } from '@/lib/logging/api'
import { getCapituloComVersiculos } from '@/lib/queries/biblia'
import { adaptRouteWithParams } from '@/lib/api/params'

async function handleGet(_request: Request, params: { id: string }) {
  const capituloId = params.id
  if (!capituloId) {
    return NextResponse.json({ error: 'Capítulo id é obrigatório' }, { status: 400 })
  }

  const capitulo = await getCapituloComVersiculos(capituloId)
  if (!capitulo) {
    return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      id: capitulo.id,
      numero: capitulo.numero,
      livro: capitulo.livro
        ? {
            id: capitulo.livro.id,
            nome: capitulo.livro.nome,
            abreviacao: capitulo.livro.abreviacao,
            testamento: capitulo.livro.testamento,
          }
        : null,
      versiculos: capitulo.versiculosBiblia?.map((versiculo) => ({
        id: versiculo.id,
        numero: versiculo.numero,
        texto: versiculo.texto,
      })) ?? [],
    },
  })
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ id: string }>(async ({ request, params }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/public/biblia/capitulos/[id]',
    feature: 'biblia_public',
  },
)
