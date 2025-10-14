import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { withApiLogging } from '@/lib/logging/api'
import { getCapituloComVersiculos } from '@/lib/queries/biblia'
import { adaptRouteWithParams } from '@/lib/api/params'

async function handleGet(_request: Request, params: { id: string }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const capituloId = params.id
  if (!capituloId) {
    return NextResponse.json({ error: 'Capítulo id é obrigatório' }, { status: 400 })
  }

  const capitulo = await getCapituloComVersiculos(capituloId)
  if (!capitulo) {
    return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
  }

  return NextResponse.json(capitulo)
}

export const GET = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) => handleGet(request, params)),
  {
    method: 'GET',
    route: '/api/biblia/capitulos/[id]',
    feature: 'biblia',
  },
)
