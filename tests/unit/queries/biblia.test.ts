import {
  listLivrosBiblia,
  listCapitulosPorLivro,
  listMetasLeitura,
  listMetasUsuario,
  listLeiturasPorUsuario,
} from '@/lib/queries/biblia'
import { Testamento } from '../../../prisma/generated/client'

jest.mock('@/lib/db', () => ({
  db: {
    livroBiblia: {
      findMany: jest.fn(),
    },
    capituloBiblia: {
      findMany: jest.fn(),
    },
    metaLeitura: {
      findMany: jest.fn(),
    },
    metaLeituraUsuario: {
      findMany: jest.fn(),
    },
    leituraRegistro: {
      findMany: jest.fn(),
    },
  },
}))

const { db } = jest.requireMock('@/lib/db') as {
  db: {
    livroBiblia: { findMany: jest.Mock }
    capituloBiblia: { findMany: jest.Mock }
    metaLeitura: { findMany: jest.Mock }
    metaLeituraUsuario: { findMany: jest.Mock }
    leituraRegistro: { findMany: jest.Mock }
  }
}

beforeEach(() => {
  db.livroBiblia.findMany.mockResolvedValue([])
  db.capituloBiblia.findMany.mockResolvedValue([])
  db.metaLeitura.findMany.mockResolvedValue([])
  db.metaLeituraUsuario.findMany.mockResolvedValue([])
  db.leituraRegistro.findMany.mockResolvedValue([])
})

describe('listLivrosBiblia', () => {
  it('aplica filtros de testamento e busca', async () => {
    await listLivrosBiblia({
      testamento: Testamento.AT,
      search: 'gen',
      take: 5,
      skip: 10,
    })

    expect(db.livroBiblia.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          testamento: Testamento.AT,
          OR: expect.arrayContaining([
            expect.objectContaining({
              nome: expect.objectContaining({ contains: 'gen' }),
            }),
          ]),
        }),
        orderBy: { ordem: 'asc' },
        take: 5,
        skip: 10,
      }),
    )
  })
})

describe('listCapitulosPorLivro', () => {
  it('inclui versículos quando solicitado', async () => {
    await listCapitulosPorLivro('seed-livro-genesis', {
      includeVersiculos: true,
      take: 10,
    })

    expect(db.capituloBiblia.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { livroId: 'seed-livro-genesis' },
        include: {
          versiculosBiblia: {
            orderBy: { numero: 'asc' },
          },
        },
        take: 10,
        orderBy: { numero: 'asc' },
      }),
    )
  })
})

describe('listMetasLeitura', () => {
  it('filtra por igreja, célula e retorna relacionamentos quando solicitado', async () => {
    await listMetasLeitura({
      igrejaId: 'seed-igreja-central',
      celulaId: null,
      includeUsuarios: true,
      includeLeituras: true,
      ativo: true,
    })

    expect(db.metaLeitura.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          igrejaId: 'seed-igreja-central',
          celulaId: null,
          ativa: true,
        },
        include: {
          usuarios: expect.any(Object),
          leituras: expect.any(Object),
        },
      }),
    )
  })
})

describe('listMetasUsuario', () => {
  it('retorna metas com progresso ordenadas por última atualização', async () => {
    await listMetasUsuario('seed-user-lider-familia', {
      includeMeta: true,
      includeProgresso: true,
    })

    expect(db.metaLeituraUsuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarioId: 'seed-user-lider-familia',
          ativa: true,
        },
        include: {
          meta: expect.any(Object),
          progressoAutomatico: expect.any(Object),
        },
        orderBy: { ultimaAtualizacao: 'desc' },
      }),
    )
  })
})

describe('listLeiturasPorUsuario', () => {
  it('aplica ordenação e inclui meta associada', async () => {
    await listLeiturasPorUsuario('seed-user-lider-familia', {
      order: 'asc',
      take: 3,
    })

    expect(db.leituraRegistro.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { usuarioId: 'seed-user-lider-familia' },
        include: { meta: true },
        orderBy: { dataLeitura: 'asc' },
        take: 3,
      }),
    )
  })
})
