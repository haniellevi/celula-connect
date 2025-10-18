import { NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/devocionais/route'
import { PerfilUsuario, Prisma } from '../../../prisma/generated/client'
import { createDevocional, listDevocionais } from '@/lib/queries/devocionais'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

jest.mock('@/lib/queries/devocionais', () => ({
  listDevocionais: jest.fn(),
  createDevocional: jest.fn(),
}))

const { auth } = require('@clerk/nextjs/server') as {
  auth: jest.Mock
}

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('/api/devocionais', () => {
  beforeEach(() => {
    auth.mockReset()
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
    ;(createDevocional as jest.Mock).mockReset()
    ;(listDevocionais as jest.Mock).mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  describe('GET', () => {
    it('retorna 401 quando não autenticado', async () => {
      auth.mockResolvedValue({ userId: null })

      const response = await GET(new Request('http://localhost/api/devocionais'))

      expect(response.status).toBe(401)
      expect(listDevocionais).not.toHaveBeenCalled()
    })

    it('aplica filtros de data e paginação quando autenticado', async () => {
      auth.mockResolvedValue({ userId: 'usr_seed_pastor' })

      ;(listDevocionais as jest.Mock).mockResolvedValue([
        { id: 'dev-1', titulo: 'Devocional 1' },
      ])

      const response = await GET(
        new Request(
          'http://localhost/api/devocionais?ativos=false&dataInicial=2025-10-01T00:00:00.000Z&dataFinal=2025-10-31T23:59:59.000Z&take=5&skip=10',
        ),
      )

      expect(listDevocionais).toHaveBeenCalledWith({
        ativos: false,
        dataInicial: expect.any(Date),
        dataFinal: expect.any(Date),
        take: 5,
        skip: 10,
      })

      const callArgs = (listDevocionais as jest.Mock).mock.calls[0][0]
      expect(callArgs.dataInicial.toISOString()).toBe('2025-10-01T00:00:00.000Z')
      expect(callArgs.dataFinal.toISOString()).toBe('2025-10-31T23:59:59.000Z')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual({
        data: [{ id: 'dev-1', titulo: 'Devocional 1' }],
        meta: {
          count: 1,
          hasMore: false,
        },
      })
    })

    it('retorna 400 quando dataInicial é inválida', async () => {
      auth.mockResolvedValue({ userId: 'usr_seed_pastor' })

      const response = await GET(
        new Request('http://localhost/api/devocionais?dataInicial=invalida'),
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toEqual(
        expect.objectContaining({
          error: 'Parâmetros inválidos',
        }),
      )
      expect(body.details?.fieldErrors?.dataInicial).toEqual(['Data inicial inválida'])
      expect(listDevocionais).not.toHaveBeenCalled()
    })

    it('retorna 400 quando dataFinal é inválida', async () => {
      auth.mockResolvedValue({ userId: 'usr_seed_pastor' })

      const response = await GET(
        new Request('http://localhost/api/devocionais?dataFinal=invalida'),
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toEqual(
        expect.objectContaining({
          error: 'Parâmetros inválidos',
        }),
      )
      expect(body.details?.fieldErrors?.dataFinal).toEqual(['Data final inválida'])
      expect(listDevocionais).not.toHaveBeenCalled()
    })
  })

  describe('POST', () => {
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
})
