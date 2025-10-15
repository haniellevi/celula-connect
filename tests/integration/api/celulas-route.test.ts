import { NextResponse } from 'next/server'
import { PUT } from '@/app/api/celulas/[id]/route'
import { PerfilUsuario } from '../../../prisma/generated/client'
import { getCelulaById, updateCelula } from '@/lib/queries/celulas'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/celulas', () => ({
  getCelulaById: jest.fn(),
  updateCelula: jest.fn(),
  deleteCelula: jest.fn(),
}))

const { requireDomainUser, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('PUT /api/celulas/[id]', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    unauthorizedResponse.mockReset()
    ;(getCelulaById as jest.Mock).mockReset()
    ;(updateCelula as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('permite atualização quando pastor está autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    ;(getCelulaById as jest.Mock).mockResolvedValue({
      id: 'seed-celula-vida',
      supervisorId: 'seed-user-supervisor',
    })
    ;(updateCelula as jest.Mock).mockResolvedValue({
      id: 'seed-celula-vida',
      nome: 'Célula Vida Renovada',
    })

    const response = await PUT(
      new Request('http://localhost/api/celulas/seed-celula-vida', {
        method: 'PUT',
        body: JSON.stringify({ nome: 'Célula Vida Renovada' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'seed-celula-vida' } },
    )

    expect(getCelulaById).toHaveBeenCalledWith('seed-celula-vida')
    expect(updateCelula).toHaveBeenCalledWith('seed-celula-vida', { nome: 'Célula Vida Renovada' })
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      success: true,
      data: { id: 'seed-celula-vida', nome: 'Célula Vida Renovada' },
    })
  })

  it('bloqueia atualização quando supervisor não pertence à célula', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-supervisor', perfil: PerfilUsuario.SUPERVISOR },
      response: null,
    })
    ;(getCelulaById as jest.Mock).mockResolvedValue({
      id: 'seed-celula-expansao',
      supervisorId: 'seed-user-supervisor-norte',
    })

    const response = await PUT(
      new Request('http://localhost/api/celulas/seed-celula-expansao', {
        method: 'PUT',
        body: JSON.stringify({ nome: 'Atualização bloqueada' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'seed-celula-expansao' } },
    )

    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(updateCelula).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Acesso não permitido' })
  })
})
