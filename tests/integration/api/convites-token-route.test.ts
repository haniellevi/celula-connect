import { GET } from '@/app/api/convites/[token]/route'

jest.mock('@/lib/queries/convites', () => ({
  getConviteByToken: jest.fn(),
  updateConvite: jest.fn(),
  deleteConvite: jest.fn(),
}))

const { getConviteByToken } = require('@/lib/queries/convites') as {
  getConviteByToken: jest.Mock
}

describe('GET /api/convites/[token]', () => {
  beforeEach(() => {
    getConviteByToken.mockReset()
  })

  it('retorna 410 para convite expirado', async () => {
    getConviteByToken.mockResolvedValue({
      id: 'seed-convite-expirado',
      tokenConvite: 'EXPIRADO123',
      dataExpiracao: new Date(Date.now() - 1000 * 60),
      usado: false,
    })

    const response = await GET(
      new Request('http://localhost/api/convites/EXPIRADO123', { method: 'GET' }),
      { params: { token: 'EXPIRADO123' } },
    )

    expect(response.status).toBe(410)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Convite expirado' })
  })
})
