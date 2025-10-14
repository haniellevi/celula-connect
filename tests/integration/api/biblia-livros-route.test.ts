import { GET } from '@/app/api/biblia/livros/route'
import { listLivrosBiblia } from '@/lib/queries/biblia'
import { Testamento } from '../../../prisma/generated/client'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/queries/biblia', () => ({
  listLivrosBiblia: jest.fn(),
}))

const { auth } = require('@clerk/nextjs/server') as {
  auth: jest.Mock
}

describe('GET /api/biblia/livros', () => {
  beforeEach(() => {
    auth.mockReset()
    ;(listLivrosBiblia as jest.Mock).mockReset()
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    auth.mockResolvedValue({ userId: null })

    const response = await GET(new Request('http://localhost/api/biblia/livros'))

    expect(response.status).toBe(401)
    expect(listLivrosBiblia).not.toHaveBeenCalled()
  })

  it('retorna livros com paginação quando autenticado', async () => {
    auth.mockResolvedValue({ userId: 'usr_seed_pastor' })
    ;(listLivrosBiblia as jest.Mock).mockResolvedValue([
      { id: 'seed-livro-genesis', nome: 'Gênesis' },
    ])

    const response = await GET(
      new Request('http://localhost/api/biblia/livros?testamento=at&take=1&skip=0'),
    )

    expect(listLivrosBiblia).toHaveBeenCalledWith({
      testamento: Testamento.AT,
      search: undefined,
      take: 1,
      skip: 0,
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      data: [{ id: 'seed-livro-genesis', nome: 'Gênesis' }],
      meta: {
        count: 1,
        hasMore: true,
      },
    })
  })
})
