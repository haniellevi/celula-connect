import { listIgrejas } from '@/lib/queries/igrejas'
import { StatusAssinatura } from '../../../prisma/generated/client'

jest.mock('@/lib/db', () => ({
  db: {
    igreja: {
      findMany: jest.fn(),
    },
  },
}))

const { db } = jest.requireMock('@/lib/db') as {
  db: {
    igreja: {
      findMany: jest.Mock
    }
  }
}

describe('listIgrejas', () => {
  beforeEach(() => {
    db.igreja.findMany.mockResolvedValue([])
  })

  it('limits results to igrejas ativas ou em trial por padrão', async () => {
    await listIgrejas()

    expect(db.igreja.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          statusAssinatura: {
            in: [StatusAssinatura.TRIAL, StatusAssinatura.ATIVA],
          },
        },
        orderBy: { nome: 'asc' },
      }),
    )
  })

  it('aceita filtro explícito de status quando informado', async () => {
    await listIgrejas({ status: [StatusAssinatura.CANCELADA] })

    expect(db.igreja.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          statusAssinatura: {
            in: [StatusAssinatura.CANCELADA],
          },
        },
      }),
    )
  })

  it('remove filtro de status quando includeInactive é verdadeiro', async () => {
    await listIgrejas({ includeInactive: true })

    expect(db.igreja.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    )
  })

  it('aplica busca textual em múltiplos campos', async () => {
    await listIgrejas({ search: 'Norte' })

    expect(db.igreja.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              nome: { contains: 'Norte', mode: 'insensitive' },
            }),
          ]),
        }),
      }),
    )
  })
})
