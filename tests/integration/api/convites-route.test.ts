import { NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/convites/route'
import { PerfilUsuario, CargoCelula } from '../../../prisma/generated/client'
import { createConvite, listConvites } from '@/lib/queries/convites'
import { getCelulaById } from '@/lib/queries/celulas'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/convites', () => ({
  listConvites: jest.fn(),
  createConvite: jest.fn(),
  getConviteById: jest.fn(),
  getConviteByToken: jest.fn(),
  updateConvite: jest.fn(),
  deleteConvite: jest.fn(),
}))

jest.mock('@/lib/queries/celulas', () => ({
  getCelulaById: jest.fn(),
}))

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

const { getConviteByToken } = require('@/lib/queries/convites') as {
  getConviteByToken: jest.Mock
}

describe('POST /api/convites', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    ;(createConvite as jest.Mock).mockReset()
    getConviteByToken.mockReset()
    ;(getCelulaById as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('cria convite para líder de célula autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-lider',
        perfil: PerfilUsuario.LIDER_CELULA,
        igrejaId: 'seed-igreja-central',
      },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(getCelulaById as jest.Mock).mockResolvedValue({
      id: 'seed-celula-vida',
      igrejaId: 'seed-igreja-central',
      supervisorId: 'seed-user-supervisor',
      liderId: 'seed-user-lider',
    })
    getConviteByToken.mockResolvedValueOnce(null)
    ;(createConvite as jest.Mock).mockResolvedValue({
      id: 'seed-convite-novo',
      celulaId: 'seed-celula-vida',
      tokenConvite: 'ABCD1234EFGH',
      emailConvidado: 'novo@exemplo.com',
    })

    const response = await POST(
      new Request('http://localhost/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          celulaId: 'seed-celula-vida',
          emailConvidado: 'novo@exemplo.com',
          nomeConvidado: 'Novo Convidado',
          cargo: CargoCelula.MEMBRO,
        }),
      }),
    )

    expect(getCelulaById).toHaveBeenCalledWith('seed-celula-vida', expect.any(Object))
    expect(createConvite).toHaveBeenCalled()

    const [dataArg] = (createConvite as jest.Mock).mock.calls[0]
    expect(dataArg).toMatchObject({
      celulaId: 'seed-celula-vida',
      convidadoPorId: 'seed-user-lider',
      emailConvidado: 'novo@exemplo.com',
      nomeConvidado: 'Novo Convidado',
      cargo: CargoCelula.MEMBRO,
    })
    expect(dataArg.tokenConvite).toHaveLength(12)

    expect(response.status).toBe(201)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.data).toEqual({
      id: 'seed-convite-novo',
      celulaId: 'seed-celula-vida',
      tokenConvite: 'ABCD1234EFGH',
      emailConvidado: 'novo@exemplo.com',
    })
  })

  it('bloqueia criação para perfil sem permissão', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-discipulo',
        perfil: PerfilUsuario.DISCIPULO,
        igrejaId: 'seed-igreja-central',
      },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await POST(
      new Request('http://localhost/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          celulaId: 'seed-celula-vida',
          emailConvidado: 'sempermissao@exemplo.com',
          nomeConvidado: 'Restrito',
        }),
      }),
    )

    expect(hasRole).toHaveBeenCalled()
    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(response.status).toBe(403)
    expect(createConvite).not.toHaveBeenCalled()
  })
})

describe('GET /api/convites', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    ;(listConvites as jest.Mock).mockReset()
  })

  it('lista convites do líder autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: {
        id: 'seed-user-lider',
        perfil: PerfilUsuario.LIDER_CELULA,
        igrejaId: 'seed-igreja-central',
      },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(listConvites as jest.Mock).mockResolvedValue([
      { id: 'seed-convite-1', celulaId: 'seed-celula-vida' },
    ])

    const response = await GET(new Request('http://localhost/api/convites', { method: 'GET' }))

    expect(listConvites).toHaveBeenCalledWith(
      expect.objectContaining({
        convidadoPorId: 'seed-user-lider',
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data).toHaveLength(1)
  })
})
