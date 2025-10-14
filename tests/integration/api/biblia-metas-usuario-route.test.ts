import { NextResponse } from 'next/server'
import { GET } from '@/app/api/biblia/metas/usuarios/[usuarioId]/route'
import { listMetasUsuario } from '@/lib/queries/biblia'
import { PerfilUsuario } from '../../../prisma/generated/client'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
}))

jest.mock('@/lib/queries/biblia', () => ({
  listMetasUsuario: jest.fn(),
}))

const { requireDomainUser, hasRole } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
}

describe('GET /api/biblia/metas/usuarios/[usuarioId]', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset().mockImplementation((user: { perfil: PerfilUsuario }, allowed: PerfilUsuario[]) =>
      allowed.includes(user.perfil),
    )
    ;(listMetasUsuario as jest.Mock).mockReset()
  })

  it('propaga resposta quando usuário de domínio não é encontrado', async () => {
    const responseMock = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    requireDomainUser.mockResolvedValue({ user: null, response: responseMock })

    const response = await GET(new Request('http://localhost/api/biblia/metas/usuarios/seed-user'), {
      params: { usuarioId: 'seed-user' },
    })

    expect(response).toBe(responseMock)
    expect(listMetasUsuario).not.toHaveBeenCalled()
  })

  it('bloqueia acesso quando usuário não é alvo nem supervisor/pastor', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-discipulo',
        perfil: PerfilUsuario.DISCIPULO,
      },
      response: null,
    })

    const response = await GET(new Request('http://localhost/api/biblia/metas/usuarios/seed-user-outro'), {
      params: { usuarioId: 'seed-user-outro' },
    })

    expect(response.status).toBe(403)
    expect(listMetasUsuario).not.toHaveBeenCalled()
  })

  it('retorna metas quando usuário requisita os próprios dados', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-discipulo',
        perfil: PerfilUsuario.DISCIPULO,
      },
      response: null,
    })
    ;(listMetasUsuario as jest.Mock).mockResolvedValue([
      { id: 'seed-meta-usuario-lider', progressoAtual: 3 },
    ])

    const response = await GET(
      new Request('http://localhost/api/biblia/metas/usuarios/seed-user-discipulo?take=1&includeMeta=false'),
      { params: { usuarioId: 'seed-user-discipulo' } },
    )

    expect(listMetasUsuario).toHaveBeenCalledWith('seed-user-discipulo', {
      ativoOnly: true,
      includeMeta: false,
      includeProgresso: true,
      take: 1,
      skip: undefined,
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      data: [{ id: 'seed-meta-usuario-lider', progressoAtual: 3 }],
      meta: {
        count: 1,
        hasMore: true,
      },
    })
  })

  it('interpreta o identificador "me" como usuário autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-discipulo',
        perfil: PerfilUsuario.DISCIPULO,
      },
      response: null,
    })
    ;(listMetasUsuario as jest.Mock).mockResolvedValue([])

    const response = await GET(new Request('http://localhost/api/biblia/metas/usuarios/me'), {
      params: { usuarioId: 'me' },
    })

    expect(listMetasUsuario).toHaveBeenCalledWith('seed-user-discipulo', {
      ativoOnly: true,
      includeMeta: true,
      includeProgresso: true,
      take: undefined,
      skip: undefined,
    })
    expect(response.status).toBe(200)
  })
})
