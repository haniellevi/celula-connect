"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { getConviteByToken, registerConviteView } from '@/lib/queries/convites'
import { getCelulaById } from '@/lib/queries/celulas'

const querySchema = z.object({
  includeCelula: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  includeIgreja: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
})

async function handleGet(request: Request, params: { token: string }) {
  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { includeCelula, includeIgreja } = parseResult.data
  const convite = await getConviteByToken(params.token, {
    celula: includeCelula,
  })

  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
  }

  const agora = new Date()
  const status: 'valid' | 'expired' | 'used' = convite.usado
    ? 'used'
    : convite.dataExpiracao < agora
      ? 'expired'
      : 'valid'

  await registerConviteView(convite.tokenConvite, status).catch((error) => {
    console.error('Falha ao registrar visualização de convite', error)
  })

  if (status === 'used') {
    return NextResponse.json({ error: 'Convite já utilizado' }, { status: 410 })
  }

  if (status === 'expired') {
    return NextResponse.json({ error: 'Convite expirado' }, { status: 410 })
  }

  let celulaDetalhes:
    | {
        id: string
        nome: string
        igrejaId: string
        igreja?: { id: string; nome: string } | null
      }
    | undefined

  if (includeCelula) {
    const celulaBase = convite.celula ?? (await getCelulaById(convite.celulaId, { igreja: includeIgreja }))
    if (celulaBase) {
      celulaDetalhes = {
        id: celulaBase.id,
        nome: celulaBase.nome,
        igrejaId: celulaBase.igrejaId,
        igreja: includeIgreja && celulaBase.igreja
          ? {
              id: celulaBase.igreja.id,
              nome: celulaBase.igreja.nome,
            }
          : undefined,
      }
    }
  }

  return NextResponse.json({
    data: {
      token: params.token,
      nomeConvidado: convite.nomeConvidado,
      emailConvidado: convite.emailConvidado,
      cargo: convite.cargo,
      dataExpiracao: convite.dataExpiracao.toISOString(),
      totalVisualizacoes: convite.totalVisualizacoes + 1,
      totalAcessosValidos: convite.totalAcessosValidos + 1,
      ultimaVisualizacaoEm: new Date().toISOString(),
      celula: celulaDetalhes ?? null,
    },
  })
}

export const GET = withApiLogging(
  (_request, ctx) => handleGet(_request, ctx.params as { token: string }),
  {
    method: 'GET',
    route: '/api/public/convites/[token]',
    feature: 'convites_public',
  },
)
