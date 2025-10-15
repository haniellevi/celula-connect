import { NextResponse } from 'next/server'
import { GET, PUT } from '@/app/api/admin/feature-flags/route'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/settings', () => ({
  listConfiguracoesSistema: jest.fn(),
  upsertConfiguracaoSistemaEntry: jest.fn(),
}))

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

const { listConfiguracoesSistema, upsertConfiguracaoSistemaEntry } = require('@/lib/queries/settings') as {
  listConfiguracoesSistema: jest.Mock
  upsertConfiguracaoSistemaEntry: jest.Mock
}

describe('/api/admin/feature-flags', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    listConfiguracoesSistema.mockReset()
    upsertConfiguracaoSistemaEntry.mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('retorna flags para pastor autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: 'PASTOR' },
      response: null,
    })
    hasRole.mockReturnValue(true)
    listConfiguracoesSistema.mockResolvedValue([
      { chave: 'ENABLE_DOMAIN_MUTATIONS', valor: 'true' },
    ])

    const response = await GET(new Request('http://localhost/api/admin/feature-flags'))

    expect(listConfiguracoesSistema).toHaveBeenCalledWith('feature_flag')
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data).toEqual({ ENABLE_DOMAIN_MUTATIONS: true })
  })

  it('atualiza flag quando permitido', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: 'PASTOR' },
      response: null,
    })
    hasRole.mockReturnValue(true)
    listConfiguracoesSistema.mockResolvedValue([
      { chave: 'ENABLE_DOMAIN_MUTATIONS', valor: 'false' },
    ])

    const response = await PUT(
      new Request('http://localhost/api/admin/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ENABLE_DOMAIN_MUTATIONS', enabled: true }),
      }),
    )

    expect(upsertConfiguracaoSistemaEntry).toHaveBeenCalledWith({
      chave: 'ENABLE_DOMAIN_MUTATIONS',
      valor: 'true',
      categoria: 'feature_flag',
      descricao: null,
      tipoCampo: 'boolean',
    })
    expect(response.status).toBe(200)
  })

  it('bloqueia acesso para perfil não autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: 'LIDER_CELULA' },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await GET(new Request('http://localhost/api/admin/feature-flags'))

    expect(response.status).toBe(403)
    expect(unauthorizedResponse).toHaveBeenCalled()
  })
})
