"use server";

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiLogging } from '@/lib/logging/api'
import { listLivrosBiblia } from '@/lib/queries/biblia'
import { Testamento } from '../../../../../../prisma/generated/client'

const querySchema = z.object({
  testamento: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined
      const upperValue = value.trim().toUpperCase()
      return upperValue in Testamento ? Testamento[upperValue as keyof typeof Testamento] : undefined
    }),
  search: z.string().optional(),
  take: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(100, Math.max(1, Number(value))) : undefined)),
  skip: z
    .string()
    .optional()
    .transform((value) => (value ? Math.max(0, Number(value)) : undefined)),
})

async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { testamento, search, take, skip } = parseResult.data

  const livros = await listLivrosBiblia({
    testamento,
    search,
    take,
    skip,
  })

  return NextResponse.json({
    data: livros.map((livro) => ({
      id: livro.id,
      nome: livro.nome,
      abreviacao: livro.abreviacao,
      testamento: livro.testamento,
      ordem: livro.ordem,
    })),
    meta: {
      count: livros.length,
      hasMore: typeof take === 'number' ? livros.length === take : false,
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/public/biblia/livros',
  feature: 'biblia_public',
})
