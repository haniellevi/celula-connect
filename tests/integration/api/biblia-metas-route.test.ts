import { NextResponse } from 'next/server'
import { GET } from '@/app/api/biblia/metas/route'
import { listMetasLeitura } from '@/lib/queries/biblia'
import { PerfilUsuario } from '../../../prisma/generated/client'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
}))

jest.mock('@/lib/queries/biblia', () => ({
  listMetasLeitura: jest.fn(),
}))

const { requireDomainUser } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
}

describe('GET /api/biblia/metas', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    ;(listMetasLeitura as jest.Mock).mockReset()
  })

  it('propaga resposta de autorização quando domínio não encontrado', async () => {
    const forbiddenResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    requireDomainUser.mockResolvedValue({ user: null, response: forbiddenResponse })

    const response = await GET(new Request('http://localhost/api/biblia/metas'))

    expect(response).toBe(forbiddenResponse)
    expect(listMetasLeitura).not.toHaveBeenCalled()
  })

  it('lista metas filtrando por igreja padrão e parâmetros opcionais', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-pastor',
        perfil: PerfilUsuario.PASTOR,
        igrejaId: 'seed-igreja-central',
      },
      response: null,
    })
    ;(listMetasLeitura as jest.Mock).mockResolvedValue([
      { id: 'seed-meta-leitura-anual', titulo: 'Meta Anual' },
    ])

    const response = await GET(
      new Request('http://localhost/api/biblia/metas?celulaId=null&includeUsuarios=true&take=1'),
    )

    expect(listMetasLeitura).toHaveBeenCalledWith({
      igrejaId: 'seed-igreja-central',
      celulaId: null,
      ativo: true,
      includeUsuarios: true,
      includeLeituras: false,
      take: 1,
      skip: undefined,
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      data: [{ id: 'seed-meta-leitura-anual', titulo: 'Meta Anual' }],
      meta: {
        count: 1,
        hasMore: true,
      },
    })
  })
})
