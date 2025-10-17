import { NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/avisos/route'
import { TipoAviso, PrioridadeAviso, PerfilUsuario } from '../../../prisma/generated/client'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/queries/avisos', () => ({
  listAvisos: jest.fn(),
  createAviso: jest.fn(),
}))

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
  unauthorizedResponse: jest.fn(),
}))

const { auth } = require('@clerk/nextjs/server') as {
  auth: jest.Mock
}

const { listAvisos, createAviso } = require('@/lib/queries/avisos') as {
  listAvisos: jest.Mock
  createAviso: jest.Mock
}

const { requireDomainUser, hasRole, unauthorizedResponse } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
  unauthorizedResponse: jest.Mock
}

describe('/api/avisos', () => {
  beforeEach(() => {
    auth.mockReset()
    listAvisos.mockReset()
    createAviso.mockReset()
    requireDomainUser.mockReset()
    hasRole.mockReset()
    unauthorizedResponse.mockReset()
  })

  describe('GET', () => {
    it('retorna 401 quando não autenticado', async () => {
      auth.mockResolvedValue({ userId: null })

      const response = await GET(new Request('http://localhost/api/avisos'))

      expect(response.status).toBe(401)
      expect(listAvisos).not.toHaveBeenCalled()
    })

    it('aplica filtros, relacionamento e paginação quando autenticado', async () => {
      auth.mockResolvedValue({ userId: 'usr_seed_pastor' })
      const now = new Date('2025-10-16T12:00:00.000Z')

      listAvisos.mockResolvedValue([
        { id: 'aviso-1', titulo: 'Aviso 1' },
        { id: 'aviso-2', titulo: 'Aviso 2' },
      ])

      const response = await GET(
        new Request(
          'http://localhost/api/avisos?igrejaId=seed-igreja&celulaId=seed-celula&usuarioId=seed-user&tipo=URGENTE&prioridade=ALTA&ativos=false&referencia=2025-10-16T12:00:00.000Z&take=2&skip=1&includeIgreja=true&includeCelula=true&includeUsuario=true',
        ),
      )

      expect(listAvisos).toHaveBeenCalledWith({
        igrejaId: 'seed-igreja',
        celulaId: 'seed-celula',
        usuarioId: 'seed-user',
        tipo: TipoAviso.URGENTE,
        prioridade: PrioridadeAviso.ALTA,
        ativos: false,
        referencia: expect.any(Date),
        take: 2,
        skip: 1,
        include: {
          igreja: true,
          celula: true,
          usuario: true,
        },
      })

      const callArgs = listAvisos.mock.calls[0]?.[0]
      expect(callArgs.referencia.toISOString()).toBe(now.toISOString())

      expect(response.status).toBe(200)
      const payload = await response.json()
      expect(payload).toEqual({
        data: [
          { id: 'aviso-1', titulo: 'Aviso 1' },
          { id: 'aviso-2', titulo: 'Aviso 2' },
        ],
        meta: {
          count: 2,
          hasMore: true,
        },
      })
    })

    it('retorna 400 quando parâmetros são inválidos', async () => {
      auth.mockResolvedValue({ userId: 'usr_seed_pastor' })

      const response = await GET(new Request('http://localhost/api/avisos?tipo=desconhecido'))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toEqual(
        expect.objectContaining({
          error: 'Parâmetros inválidos',
        }),
      )
      expect(listAvisos).not.toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    it('retorna resposta customizada quando domínio não está autenticado', async () => {
      const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      requireDomainUser.mockResolvedValue({
        user: null,
        response: unauthorized,
      })

      const response = await POST(
        new Request('http://localhost/api/avisos', { method: 'POST' }),
      )

      expect(response.status).toBe(401)
      expect(createAviso).not.toHaveBeenCalled()
    })

    it('bloqueia perfis sem permissão de gerenciamento', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-discipulo',
          perfil: PerfilUsuario.DISCIPULO,
          igrejaId: 'seed-igreja',
        },
        response: null,
      })
      hasRole.mockReturnValue(false)
      unauthorizedResponse.mockReturnValue(
        NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
      )

      const response = await POST(
        new Request('http://localhost/api/avisos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: 'Aviso teste',
            conteudo: 'Conteúdo',
            tipo: TipoAviso.GERAL,
            dataInicio: new Date().toISOString(),
          }),
        }),
      )

      expect(response.status).toBe(403)
      expect(createAviso).not.toHaveBeenCalled()
    })

    it('cria aviso com fallback de igreja e usuário do domínio', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-supervisor',
          perfil: PerfilUsuario.SUPERVISOR,
          igrejaId: 'seed-igreja-default',
        },
        response: null,
      })
      hasRole.mockReturnValue(true)
      createAviso.mockResolvedValue({
        id: 'aviso-novo',
        titulo: 'Retiro de líderes',
      })

      const payload = {
        titulo: 'Retiro de líderes',
        conteudo: 'Agenda confirmada para novembro.',
        tipo: TipoAviso.INFORMATIVO,
        prioridade: PrioridadeAviso.URGENTE,
          dataInicio: new Date('2025-11-01T10:00:00.000Z'),
          dataFim: new Date('2025-11-05T18:00:00.000Z'),
        ativo: true,
      }

      const response = await POST(
        new Request('http://localhost/api/avisos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      )

      expect(createAviso).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Retiro de líderes',
          conteudo: 'Agenda confirmada para novembro.',
          tipo: TipoAviso.INFORMATIVO,
          prioridade: PrioridadeAviso.URGENTE,
          dataInicio: expect.any(Date),
          dataFim: expect.any(Date),
          ativo: true,
          igrejaId: 'seed-igreja-default',
          usuarioId: 'seed-user-supervisor',
        }),
        {
          igreja: true,
          celula: true,
          usuario: true,
        },
      )

      const createdArgs = createAviso.mock.calls[0]?.[0]
      expect(createdArgs.dataInicio.toISOString()).toBe('2025-11-01T10:00:00.000Z')
      expect(createdArgs.dataFim?.toISOString()).toBe('2025-11-05T18:00:00.000Z')

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toEqual({
        success: true,
        data: {
          id: 'aviso-novo',
          titulo: 'Retiro de líderes',
        },
      })
    })
  })
})
