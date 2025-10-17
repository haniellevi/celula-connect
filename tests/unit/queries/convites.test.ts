import { registerConviteView } from '@/lib/queries/convites'

jest.mock('@/lib/db', () => ({
  db: {
    convite: {
      update: jest.fn(),
    },
  },
}))

const { db } = jest.requireMock('@/lib/db') as {
  db: {
    convite: {
      update: jest.Mock
    }
  }
}

describe('registerConviteView', () => {
  beforeEach(() => {
    db.convite.update.mockReset()
    db.convite.update.mockResolvedValue({ id: 'seed-convite' })
  })

  it('incrementa visualizacoes e acessos validos quando o convite esta valido', async () => {
    await registerConviteView('VALIDO123', 'valid')

    expect(db.convite.update).toHaveBeenCalledTimes(1)

    const callArgs = db.convite.update.mock.calls[0]?.[0]

    expect(callArgs).toBeDefined()
    expect(callArgs.data).toBeDefined()
    expect(callArgs.where).toEqual({ tokenConvite: 'VALIDO123' })
    expect(callArgs.data.totalVisualizacoes).toEqual({ increment: 1 })
    expect(callArgs.data.totalAcessosValidos).toEqual({ increment: 1 })
    expect(callArgs.data.ultimaVisualizacaoEm).toBeInstanceOf(Date)
  })

  it('registra apenas visualizacao para convites expirados', async () => {
    await registerConviteView('EXPIRADO123', 'expired')

    expect(db.convite.update).toHaveBeenCalledTimes(1)

    const callArgs = db.convite.update.mock.calls[0]?.[0]

    expect(callArgs).toBeDefined()
    expect(callArgs.data).toBeDefined()
    expect(callArgs.where).toEqual({ tokenConvite: 'EXPIRADO123' })
    expect(callArgs.data.totalVisualizacoes).toEqual({ increment: 1 })
    expect(callArgs.data.totalAcessosValidos).toBeUndefined()
    expect(callArgs.data.ultimaVisualizacaoEm).toBeInstanceOf(Date)
  })

  it('registra apenas visualizacao para convites ja utilizados', async () => {
    await registerConviteView('USADO123', 'used')

    expect(db.convite.update).toHaveBeenCalledTimes(1)

    const callArgs = db.convite.update.mock.calls[0]?.[0]

    expect(callArgs).toBeDefined()
    expect(callArgs.data).toBeDefined()
    expect(callArgs.where).toEqual({ tokenConvite: 'USADO123' })
    expect(callArgs.data.totalVisualizacoes).toEqual({ increment: 1 })
    expect(callArgs.data.totalAcessosValidos).toBeUndefined()
    expect(callArgs.data.ultimaVisualizacaoEm).toBeInstanceOf(Date)
  })
})
