import { POST } from '@/app/api/biblia/leituras/route'
import { db } from '@/lib/db'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    livroBiblia: {
      findFirst: jest.fn(),
    },
    metaLeituraUsuario: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const { requireDomainUser } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
}

describe('POST /api/biblia/leituras', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    ;(db.livroBiblia.findFirst as jest.Mock).mockReset()
    ;(db.metaLeituraUsuario.findFirst as jest.Mock).mockReset()
    ;(db.$transaction as jest.Mock).mockReset()
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: null,
      response: new Response('Unauthorized', { status: 401 }),
    })

    const response = await POST(
      new Request('http://localhost/api/biblia/leituras', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).toBe(401)
  })

  it('registra leitura sem meta vinculada', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-disc', perfil: 'DISCIPULO' },
      response: null,
    })
    ;(db.livroBiblia.findFirst as jest.Mock).mockResolvedValue({ codigo: 'gn', nome: 'Gênesis' })
    ;(db.metaLeituraUsuario.findFirst as jest.Mock).mockResolvedValue(null)

    const createLeituraMock = jest.fn().mockResolvedValue({
      id: 'leitura-1',
      usuarioId: 'seed-user-disc',
      livroCodigo: 'gn',
      capitulo: 1,
    })

    ;(db.$transaction as jest.Mock).mockImplementation(async (callback: any) =>
      callback({
        leituraRegistro: { create: createLeituraMock },
        progressoAutomaticoMeta: { create: jest.fn() },
        metaLeituraUsuario: { update: jest.fn() },
      }),
    )

    const response = await POST(
      new Request('http://localhost/api/biblia/leituras', {
        method: 'POST',
        body: JSON.stringify({
          livroCodigo: 'gn',
          capitulo: 1,
        }),
      }),
    )

    expect(response.status).toBe(201)
    expect(createLeituraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuarioId: 'seed-user-disc',
          livroCodigo: 'gn',
          capitulo: 1,
        }),
      }),
    )
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.data.metaUsuario).toBeNull()
  })

  it('atualiza progresso quando meta é informada', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-disc', perfil: 'DISCIPULO' },
      response: null,
    })
    ;(db.livroBiblia.findFirst as jest.Mock).mockResolvedValue({ codigo: 'gn', nome: 'Gênesis' })
    ;(db.metaLeituraUsuario.findFirst as jest.Mock).mockResolvedValue({
      id: 'meta-usuario-1',
      metaId: 'meta-1',
      usuarioId: 'seed-user-disc',
      progressoAtual: 3,
      meta: {
        id: 'meta-1',
        valorMeta: 10,
      },
    })

    const createLeituraMock = jest.fn().mockResolvedValue({
      id: 'leitura-1',
      usuarioId: 'seed-user-disc',
      livroCodigo: 'gn',
      capitulo: 2,
      metaId: 'meta-1',
    })
    const createProgressoMock = jest.fn().mockResolvedValue({})
    const updateMetaUsuarioMock = jest.fn().mockResolvedValue({
      id: 'meta-usuario-1',
      progressoAtual: 4,
    })

    ;(db.$transaction as jest.Mock).mockImplementation(async (callback: any) =>
      callback({
        leituraRegistro: { create: createLeituraMock },
        progressoAutomaticoMeta: { create: createProgressoMock },
        metaLeituraUsuario: { update: updateMetaUsuarioMock },
      }),
    )

    const response = await POST(
      new Request('http://localhost/api/biblia/leituras', {
        method: 'POST',
        body: JSON.stringify({
          livroCodigo: 'gn',
          capitulo: 2,
          metaId: 'meta-1',
          tempoLeitura: 12,
        }),
      }),
    )

    expect(createProgressoMock).toHaveBeenCalled()
    expect(updateMetaUsuarioMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'meta-usuario-1' },
        data: expect.objectContaining({
          progressoAtual: 4,
        }),
      }),
    )
    expect(response.status).toBe(201)
    const payload = await response.json()
    expect(payload.data.metaUsuario).toEqual({ id: 'meta-usuario-1', progressoAtual: 4 })
  })
})
