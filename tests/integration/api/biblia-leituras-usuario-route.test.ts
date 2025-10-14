import { NextResponse } from 'next/server'
import { GET } from '@/app/api/biblia/leituras/usuarios/[usuarioId]/route'
import { listLeiturasPorUsuario } from '@/lib/queries/biblia'
import { PerfilUsuario } from '../../../prisma/generated/client'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
}))

jest.mock('@/lib/queries/biblia', () => ({
  listLeiturasPorUsuario: jest.fn(),
}))

const { requireDomainUser, hasRole } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
}

describe('GET /api/biblia/leituras/usuarios/[usuarioId]', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset().mockImplementation((user: { perfil: PerfilUsuario }, allowed: PerfilUsuario[]) =>
      allowed.includes(user.perfil),
    )
    ;(listLeiturasPorUsuario as jest.Mock).mockReset()
  })

  it('propaga resposta quando domínio não está disponível', async () => {
    const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    requireDomainUser.mockResolvedValue({ user: null, response: unauthorized })

    const response = await GET(new Request('http://localhost/api/biblia/leituras/usuarios/seed-user'), {
      params: { usuarioId: 'seed-user' },
    })

    expect(response).toBe(unauthorized)
    expect(listLeiturasPorUsuario).not.toHaveBeenCalled()
  })

  it('permite acesso para supervisores consultarem outros usuários', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-supervisor',
        perfil: PerfilUsuario.SUPERVISOR,
      },
      response: null,
    })
    ;(listLeiturasPorUsuario as jest.Mock).mockResolvedValue([
      { id: 'seed-leitura-lider-gen', livroCodigo: 'GEN' },
    ])

    const response = await GET(
      new Request('http://localhost/api/biblia/leituras/usuarios/seed-user-discipulo?order=asc'),
      { params: { usuarioId: 'seed-user-discipulo' } },
    )

    expect(listLeiturasPorUsuario).toHaveBeenCalledWith('seed-user-discipulo', {
      order: 'asc',
      take: undefined,
      skip: undefined,
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      data: [{ id: 'seed-leitura-lider-gen', livroCodigo: 'GEN' }],
      meta: {
        count: 1,
        hasMore: false,
      },
    })
  })
})
