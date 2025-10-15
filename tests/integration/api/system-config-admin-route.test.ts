import { NextResponse } from 'next/server'
import { GET, PUT } from '@/app/api/admin/configuracoes/route'
import { PerfilUsuario } from '../../../prisma/generated/client'
import { listConfiguracoesSistema, upsertConfiguracaoSistemaEntry } from '@/lib/queries/settings'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/settings', () => ({
  listConfiguracoesSistema: jest.fn(),
  upsertConfiguracaoSistemaEntry: jest.fn(),
  deleteConfiguracaoSistemaEntry: jest.fn(),
}))

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('GET /api/admin/configuracoes', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    ;(listConfiguracoesSistema as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('lista configurações para pastor', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(listConfiguracoesSistema as jest.Mock).mockResolvedValue([
      { chave: 'trial_dias', valor: '30', categoria: 'assinaturas' },
    ])

    const response = await GET(new Request('http://localhost/api/admin/configuracoes'))

    expect(listConfiguracoesSistema).toHaveBeenCalledWith(undefined)
    expect(response.status).toBe(200)
  })

  it('bloqueia acesso para líder', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await GET(new Request('http://localhost/api/admin/configuracoes'))

    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(response.status).toBe(403)
  })
})

describe('PUT /api/admin/configuracoes', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    ;(upsertConfiguracaoSistemaEntry as jest.Mock).mockReset()
    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('atualiza configuração quando autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(upsertConfiguracaoSistemaEntry as jest.Mock).mockResolvedValue({
      chave: 'suporte_email',
      valor: 'contato@celula.dev',
      categoria: 'comunicacao',
    })

    const response = await PUT(
      new Request('http://localhost/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'suporte_email',
          value: 'contato@celula.dev',
          categoria: 'comunicacao',
          descricao: null,
        }),
      }),
    )

    expect(upsertConfiguracaoSistemaEntry).toHaveBeenCalledWith({
      chave: 'suporte_email',
      valor: 'contato@celula.dev',
      categoria: 'comunicacao',
      descricao: null,
      tipoCampo: undefined,
    })
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
  })
})
