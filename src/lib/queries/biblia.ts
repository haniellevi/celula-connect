import { db } from '@/lib/db'
import type { Prisma, Testamento } from '@/lib/prisma-client'

export interface ListLivrosBibliaOptions {
  testamento?: Testamento
  search?: string
  take?: number
  skip?: number
}

export async function listLivrosBiblia({
  testamento,
  search,
  take,
  skip,
}: ListLivrosBibliaOptions = {}) {
  const where: Prisma.LivroBibliaWhereInput = {}

  if (testamento) {
    where.testamento = testamento
  }

  if (search) {
    const normalized = search.trim()
    where.OR = [
      { nome: { contains: normalized, mode: 'insensitive' } },
      { codigo: { contains: normalized, mode: 'insensitive' } },
      { abreviacao: { contains: normalized, mode: 'insensitive' } },
    ]
  }

  return db.livroBiblia.findMany({
    where,
    orderBy: { ordem: 'asc' },
    take,
    skip,
  })
}

export interface ListCapitulosPorLivroOptions {
  includeVersiculos?: boolean
  take?: number
  skip?: number
}

export async function listCapitulosPorLivro(
  livroId: string,
  {
    includeVersiculos = false,
    take,
    skip,
  }: ListCapitulosPorLivroOptions = {},
) {
  return db.capituloBiblia.findMany({
    where: { livroId },
    orderBy: { numero: 'asc' },
    include: includeVersiculos ? { versiculosBiblia: { orderBy: { numero: 'asc' } } } : undefined,
    take,
    skip,
  })
}

export async function getCapituloComVersiculos(id: string) {
  return db.capituloBiblia.findUnique({
    where: { id },
    include: {
      livro: true,
      versiculosBiblia: {
        orderBy: { numero: 'asc' },
      },
    },
  })
}

export interface ListMetasLeituraOptions {
  igrejaId?: string
  celulaId?: string | null
  ativo?: boolean
  includeUsuarios?: boolean
  includeLeituras?: boolean
  take?: number
  skip?: number
}

export async function listMetasLeitura({
  igrejaId,
  celulaId,
  ativo = true,
  includeUsuarios = false,
  includeLeituras = false,
  take,
  skip,
}: ListMetasLeituraOptions = {}) {
  const where: Prisma.MetaLeituraWhereInput = {}

  if (igrejaId) where.igrejaId = igrejaId
  if (celulaId !== undefined) where.celulaId = celulaId
  if (typeof ativo === 'boolean') where.ativa = ativo

  return db.metaLeitura.findMany({
    where,
    orderBy: [{ dataInicio: 'desc' }, { titulo: 'asc' }],
    include: {
      usuarios: includeUsuarios
        ? {
            include: {
              usuario: true,
              progressoAutomatico: true,
            },
          }
        : undefined,
      leituras: includeLeituras ? { orderBy: { dataLeitura: 'desc' } } : undefined,
    },
    take,
    skip,
  })
}

export interface ListMetasUsuarioOptions {
  ativoOnly?: boolean
  includeMeta?: boolean
  includeProgresso?: boolean
  take?: number
  skip?: number
}

export async function listMetasUsuario(
  usuarioId: string,
  {
    ativoOnly = true,
    includeMeta = true,
    includeProgresso = true,
    take,
    skip,
  }: ListMetasUsuarioOptions = {},
) {
  return db.metaLeituraUsuario.findMany({
    where: {
      usuarioId,
      ...(ativoOnly ? { ativa: true } : {}),
    },
    orderBy: { ultimaAtualizacao: 'desc' },
    include: {
      meta: includeMeta
        ? {
            include: {
              igreja: true,
              celula: true,
            },
          }
        : undefined,
      progressoAutomatico: includeProgresso ? { orderBy: { dataLeitura: 'desc' } } : undefined,
    },
    take,
    skip,
  })
}

export interface ListLeiturasUsuarioOptions {
  order?: 'asc' | 'desc'
  take?: number
  skip?: number
}

export async function listLeiturasPorUsuario(
  usuarioId: string,
  { order = 'desc', take, skip }: ListLeiturasUsuarioOptions = {},
) {
  return db.leituraRegistro.findMany({
    where: { usuarioId },
    orderBy: { dataLeitura: order },
    include: {
      meta: true,
    },
    take,
    skip,
  })
}

export interface MetasLeituraSummaryFilters {
  igrejaId?: string
  celulaId?: string | null
  rangeDays?: number
}

export interface MetasLeituraSummary {
  filters: {
    igrejaId?: string
    celulaId?: string | null
    rangeDays: number
  }
  totals: {
    totalMetas: number
    metasAtivas: number
    participantes: number
    participantesAtivos: number
    leiturasRegistradas: number
    leiturasPeriodo: number
    tempoLeituraPeriodo: number
    progressoMedio: number
  }
  breakdown: {
    metasPorTipo: Record<string, number>
    metasPorUnidade: Record<string, number>
  }
  highlights: {
    metasEmDestaque: Array<{
      id: string
      titulo: string
      progressoMedio: number
      participantesAtivos: number
    }>
    metasEmRisco: Array<{
      id: string
      titulo: string
      progressoMedio: number
      diasRestantes: number
    }>
  }
  history: {
    leiturasPorDia: Array<{
      date: string
      leituras: number
      tempoTotal: number
    }>
  }
  generatedAt: string
}

export async function getMetasLeituraSummary({
  igrejaId,
  celulaId,
  rangeDays = 30,
}: MetasLeituraSummaryFilters = {}): Promise<MetasLeituraSummary> {
  const sanitizedRange = Math.min(Math.max(rangeDays, 7), 120)
  const metaWhere: Prisma.MetaLeituraWhereInput = {}

  if (igrejaId) metaWhere.igrejaId = igrejaId
  if (celulaId !== undefined) metaWhere.celulaId = celulaId

  const metas = await db.metaLeitura.findMany({
    where: metaWhere,
    select: {
      id: true,
      titulo: true,
      valorMeta: true,
      tipoMeta: true,
      unidade: true,
      ativa: true,
      dataFim: true,
      usuarios: {
        select: {
          id: true,
          ativa: true,
          progressoAtual: true,
        },
      },
    },
  })

  const metaIds = metas.map((meta) => meta.id)
  const totalMetas = metas.length
  const metasAtivas = metas.filter((meta) => meta.ativa).length

  const participantes = metas.reduce((acc, meta) => acc + meta.usuarios.length, 0)
  const participantesAtivos = metas.reduce(
    (acc, meta) => acc + meta.usuarios.filter((usuario) => usuario.ativa).length,
    0,
  )

  const metasPorTipo: Record<string, number> = {}
  const metasPorUnidade: Record<string, number> = {}

  metas.forEach((meta) => {
    metasPorTipo[meta.tipoMeta] = (metasPorTipo[meta.tipoMeta] ?? 0) + 1
    metasPorUnidade[meta.unidade] = (metasPorUnidade[meta.unidade] ?? 0) + 1
  })

  let progressoMedio = 0
  let progressoPercentualTotal = 0
  let participantesConsiderados = 0

  metas.forEach((meta) => {
    const divisor = meta.valorMeta || 1
    meta.usuarios.forEach((usuario) => {
      const progresso = usuario.progressoAtual ?? 0
      const percentual = Math.min(100, (progresso / divisor) * 100)
      progressoPercentualTotal += percentual
      participantesConsiderados += 1
    })
  })

  if (participantesConsiderados) {
    progressoMedio = Number((progressoPercentualTotal / participantesConsiderados).toFixed(2))
  }

  let leiturasRegistradas = 0
  if (metaIds.length) {
    leiturasRegistradas = await db.leituraRegistro.count({
      where: {
        metaId: { in: metaIds },
      },
    })
  }

  const periodStart = new Date(Date.now() - sanitizedRange * 24 * 60 * 60 * 1000)

  const leiturasRecentes = metaIds.length
    ? await db.leituraRegistro.findMany({
        where: {
          metaId: { in: metaIds },
          dataLeitura: {
            gte: periodStart,
          },
        },
        select: {
          dataLeitura: true,
          tempoLeitura: true,
        },
      })
    : []

  const historyMap = new Map<
    string,
    {
      leituras: number
      tempoTotal: number
    }
  >()

  let leiturasPeriodo = 0
  let tempoLeituraPeriodo = 0

  for (const leitura of leiturasRecentes) {
    const dateKey = leitura.dataLeitura.toISOString().slice(0, 10)
    const entry = historyMap.get(dateKey) ?? { leituras: 0, tempoTotal: 0 }
    entry.leituras += 1
    if (typeof leitura.tempoLeitura === 'number') {
      entry.tempoTotal += leitura.tempoLeitura
      tempoLeituraPeriodo += leitura.tempoLeitura
    }
    historyMap.set(dateKey, entry)
    leiturasPeriodo += 1
  }

  const history: Array<{ date: string; leituras: number; tempoTotal: number }> = []
  const today = new Date()

  for (let i = sanitizedRange - 1; i >= 0; i -= 1) {
    const current = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const key = current.toISOString().slice(0, 10)
    const entry = historyMap.get(key) ?? { leituras: 0, tempoTotal: 0 }
    history.push({
      date: key,
      leituras: entry.leituras,
      tempoTotal: entry.tempoTotal,
    })
  }

  const metasComProgresso = metas
    .map((meta) => {
      const participantesMeta = meta.usuarios.length || 1
      const divisor = meta.valorMeta || 1
      const progressoMetaPercentual =
        meta.usuarios.reduce((acc, usuario) => {
          const progresso = usuario.progressoAtual ?? 0
          return acc + Math.min(100, (progresso / divisor) * 100)
        }, 0) / participantesMeta
      const progressoMeta = Number(progressoMetaPercentual.toFixed(2))
      const participantesAtivosMeta = meta.usuarios.filter((usuario) => usuario.ativa).length
      return {
        id: meta.id,
        titulo: meta.titulo,
        progressoMedio: progressoMeta,
        participantesAtivos: participantesAtivosMeta,
        ativa: meta.ativa,
        diasRestantes: Math.ceil((meta.dataFim.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)),
      }
    })
    .sort((a, b) => b.progressoMedio - a.progressoMedio)

  const metasEmDestaque = metasComProgresso.slice(0, 3).map((meta) => ({
    id: meta.id,
    titulo: meta.titulo,
    progressoMedio: meta.progressoMedio,
    participantesAtivos: meta.participantesAtivos,
  }))

  const metasEmRisco = metasComProgresso
    .filter((meta) => meta.ativa && meta.progressoMedio < 50)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 3)
    .map((meta) => ({
      id: meta.id,
      titulo: meta.titulo,
      progressoMedio: meta.progressoMedio,
      diasRestantes: meta.diasRestantes,
    }))

  return {
    filters: {
      igrejaId,
      celulaId,
      rangeDays: sanitizedRange,
    },
    totals: {
      totalMetas,
      metasAtivas,
      participantes,
      participantesAtivos,
      leiturasRegistradas,
      leiturasPeriodo,
      tempoLeituraPeriodo,
      progressoMedio,
    },
    breakdown: {
      metasPorTipo,
      metasPorUnidade,
    },
    highlights: {
      metasEmDestaque,
      metasEmRisco,
    },
    history: {
      leiturasPorDia: history,
    },
    generatedAt: new Date().toISOString(),
  }
}
