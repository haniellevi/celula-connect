import { NextResponse } from 'next/server'
import { GET, PUT } from '@/app/api/admin/landing-config/route'
import { PerfilUsuario } from '../../../prisma/generated/client'
import { listLandingPageConfig, upsertLandingPageConfigEntry } from '@/lib/queries/settings'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/settings', () => ({
  listLandingPageConfig: jest.fn(),
  upsertLandingPageConfigEntry: jest.fn(),
  deleteLandingPageConfigEntry: jest.fn(),
}))

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('GET /api/admin/landing-config', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    ;(listLandingPageConfig as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('retorna configurações para pastor autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(listLandingPageConfig as jest.Mock).mockResolvedValue([
      { secao: 'hero', chave: 'headline', valor: 'Chamada' },
    ])

    const response = await GET(new Request('http://localhost/api/admin/landing-config'))

    expect(listLandingPageConfig).toHaveBeenCalledWith(undefined)
    expect(response.status).toBe(200)
  })

  it('bloqueia acesso para perfil sem permissão', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await GET(new Request('http://localhost/api/admin/landing-config'))

    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(response.status).toBe(403)
  })
})

describe('PUT /api/admin/landing-config', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    ;(upsertLandingPageConfigEntry as jest.Mock).mockReset()
    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('atualiza entradas quando autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-supervisor', perfil: PerfilUsuario.SUPERVISOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(upsertLandingPageConfigEntry as jest.Mock).mockResolvedValue({
      secao: 'hero',
      chave: 'headline',
      valor: 'Atualizado',
    })

    const response = await PUT(
      new Request('http://localhost/api/admin/landing-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'hero',
          key: 'headline',
          value: 'Atualizado',
        }),
      }),
    )

    expect(upsertLandingPageConfigEntry).toHaveBeenCalledWith({
      secao: 'hero',
      chave: 'headline',
      valor: 'Atualizado',
      tipo: undefined,
    })
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
  })
})
