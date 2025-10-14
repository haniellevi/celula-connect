import { GET } from '@/app/api/igrejas/route'
import { listIgrejas } from '@/lib/queries/igrejas'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/queries/igrejas', () => ({
  listIgrejas: jest.fn(),
}))

const { auth } = require('@clerk/nextjs/server') as {
  auth: jest.Mock
}

describe('GET /api/igrejas', () => {
  beforeEach(() => {
    auth.mockReset()
    ;(listIgrejas as jest.Mock).mockReset()
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    auth.mockResolvedValue({ userId: null })

    const response = await GET(new Request('http://localhost/api/igrejas'))

    expect(response.status).toBe(401)
  })

  it('retorna dados e metadados quando autorizado', async () => {
    auth.mockResolvedValue({ userId: 'usr_seed_pastor' })
    ;(listIgrejas as jest.Mock).mockResolvedValue([
      { id: 'seed-igreja-central', nome: 'Igreja Central Seed' },
    ])

    const response = await GET(
      new Request(
        'http://localhost/api/igrejas?includeCelulas=true&take=1&skip=0',
      ),
    )

    expect(listIgrejas).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      includeInactive: false,
      take: 1,
      skip: 0,
      include: {
        plano: true,
        celulas: true,
      },
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      data: [{ id: 'seed-igreja-central', nome: 'Igreja Central Seed' }],
      meta: {
        count: 1,
        hasMore: true,
      },
    })
  })
})
