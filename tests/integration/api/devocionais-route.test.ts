import { NextResponse } from 'next/server'
import { POST } from '@/app/api/devocionais/route'
import { PerfilUsuario, Prisma } from '../../../prisma/generated/client'
import { createDevocional } from '@/lib/queries/devocionais'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/devocionais', () => ({
  listDevocionais: jest.fn(),
  createDevocional: jest.fn(),
}))

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('POST /api/devocionais', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    ;(createDevocional as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('permite criação quando usuário possui perfil autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(createDevocional as jest.Mock).mockResolvedValue({
      id: 'seed-devocional-2025-10-14',
      titulo: 'Novo Devocional',
    })

    const response = await POST(
      new Request('http://localhost/api/devocionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Novo Devocional',
          versiculoReferencia: 'Salmos 23:1',
          versiculoTexto: 'O Senhor é o meu pastor; nada me faltará.',
          conteudo: 'Conteúdo devocional',
          dataDevocional: '2025-10-14',
        }),
      }),
    )

    expect(hasRole).toHaveBeenCalled()
    expect(createDevocional).toHaveBeenCalledWith({
      titulo: 'Novo Devocional',
      versiculoReferencia: 'Salmos 23:1',
      versiculoTexto: 'O Senhor é o meu pastor; nada me faltará.',
      conteudo: 'Conteúdo devocional',
      dataDevocional: new Date('2025-10-14'),
      ativo: true,
    })

    expect(response.status).toBe(201)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.data).toEqual({
      id: 'seed-devocional-2025-10-14',
      titulo: 'Novo Devocional',
    })
  })

  it('bloqueia criação para perfis sem permissão', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-discipulo', perfil: PerfilUsuario.DISCIPULO },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await POST(
      new Request('http://localhost/api/devocionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Tentativa inválida',
          versiculoReferencia: 'João 3:16',
          versiculoTexto: 'Porque Deus amou o mundo...',
          conteudo: 'Conteúdo bloqueado',
          dataDevocional: '2025-10-15',
        }),
      }),
    )

    expect(hasRole).toHaveBeenCalled()
    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(response.status).toBe(403)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Acesso não permitido' })
    expect(createDevocional).not.toHaveBeenCalled()
  })

  it('retorna 409 quando já existe devocional para a data', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(createDevocional as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.0.1',
      }),
    )

    const response = await POST(
      new Request('http://localhost/api/devocionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Conflito de data',
          versiculoReferencia: 'Romanos 8:28',
          versiculoTexto: 'Todas as coisas cooperam...',
          conteudo: 'Conteúdo duplicado',
          dataDevocional: '2025-10-12',
        }),
      }),
    )

    expect(response.status).toBe(409)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Já existe um devocional para esta data' })
  })
})
