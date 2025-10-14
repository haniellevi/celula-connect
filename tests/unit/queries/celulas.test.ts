import { listCelulas } from '@/lib/queries/celulas'

jest.mock('@/lib/db', () => ({
  db: {
    celula: {
      findMany: jest.fn(),
    },
  },
}))

const { db } = jest.requireMock('@/lib/db') as {
  db: {
    celula: {
      findMany: jest.Mock
    }
  }
}

describe('listCelulas', () => {
  beforeEach(() => {
    db.celula.findMany.mockResolvedValue([])
  })

  it('aplica filtros de relacionamento quando fornecidos', async () => {
    await listCelulas({
      igrejaId: 'seed-igreja-central',
      liderId: 'seed-user-lider',
      supervisorId: 'seed-user-supervisor',
    })

    expect(db.celula.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          igrejaId: 'seed-igreja-central',
          liderId: 'seed-user-lider',
          supervisorId: 'seed-user-supervisor',
        },
        orderBy: [{ igrejaId: 'asc' }, { nome: 'asc' }],
      }),
    )
  })

  it('aplica busca por nome de forma case insensitive', async () => {
    await listCelulas({ search: 'Família' })

    expect(db.celula.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          nome: { contains: 'Família', mode: 'insensitive' },
        },
      }),
    )
  })

  it('propaga opções de paginação e include', async () => {
    const include = { igreja: true }

    await listCelulas({
      take: 5,
      skip: 10,
      include,
    })

    expect(db.celula.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include,
        take: 5,
        skip: 10,
      }),
    )
  })
})
