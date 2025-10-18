import { GET } from '@/app/api/dashboard/[perfil]/route'
import { PerfilUsuario } from '@/lib/prisma-client'
import { requireDomainUser, hasRole } from '@/lib/domain-auth'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    igreja: { count: jest.fn() },
    celula: { count: jest.fn(), findMany: jest.fn() },
    usuario: { count: jest.fn() },
    solicitacaoAvancoTrilha: { count: jest.fn() },
    convite: { count: jest.fn() },
  },
}))

const { db } = require('@/lib/db') as {
  db: {
    igreja: { count: jest.Mock }
    celula: { count: jest.Mock; findMany: jest.Mock }
    usuario: { count: jest.Mock }
    solicitacaoAvancoTrilha: { count: jest.Mock }
    convite: { count: jest.Mock }
  }
}

describe('GET /api/dashboard/[perfil]', () => {
  const mockDomainUser = requireDomainUser as jest.Mock
  const mockHasRole = hasRole as unknown as jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    mockHasRole.mockImplementation(
      (user: { perfil: PerfilUsuario } | null, allowed: PerfilUsuario[]) =>
        !!user && allowed.includes(user.perfil),
    )
  })

  const requestFor = (perfil: string) =>
    new Request(`http://localhost/api/dashboard/${perfil}`)

  it('retorna estatísticas consolidadas para o pastor', async () => {
    mockDomainUser.mockResolvedValue({
      user: { id: 'user-pastor', perfil: PerfilUsuario.PASTOR },
      response: null,
    })

    db.igreja.count.mockResolvedValue(3)
    db.celula.count.mockResolvedValue(12)
    db.usuario.count
      .mockResolvedValueOnce(120) // discípulos
      .mockResolvedValueOnce(18) // líderes
      .mockResolvedValueOnce(6) // supervisores
    db.solicitacaoAvancoTrilha.count.mockResolvedValue(4)
    db.convite.count.mockResolvedValue(9)

    const response = await GET(requestFor('pastor'), { params: { perfil: 'pastor' } })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.perfil).toBe('pastor')
    expect(payload.data.stats).toEqual({
      totalIgrejas: 3,
      totalCelulas: 12,
      totalDiscipulos: 120,
      totalLideres: 18,
      totalSupervisores: 6,
      solicitacoesPendentes: 4,
      convitesPendentes: 9,
    })
    expect(typeof payload.data.generatedAt).toBe('string')
  })

  it('retorna métricas específicas para supervisores', async () => {
    mockDomainUser.mockResolvedValue({
      user: { id: 'user-supervisor', perfil: PerfilUsuario.SUPERVISOR },
      response: null,
    })

    db.celula.findMany.mockResolvedValue([
      {
        membros: [{ ativo: true }, { ativo: false }],
        reunioes: [{ presentes: 12 }, { presentes: 10 }],
      },
      {
        membros: [{ ativo: true }],
        reunioes: [{ presentes: 8 }],
      },
    ])
    db.solicitacaoAvancoTrilha.count.mockResolvedValue(3)
    db.convite.count.mockResolvedValue(5)

    const response = await GET(requestFor('supervisor'), { params: { perfil: 'supervisor' } })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.perfil).toBe('supervisor')
    expect(payload.data.stats).toEqual({
      totalCelulas: 2,
      membrosAtivos: 2,
      mediaPresenca: 10,
      convitesPendentes: 5,
      solicitacoesPendentes: 3,
    })
  })

  it('nega acesso quando o usuário não possui o papel necessário', async () => {
    mockDomainUser.mockResolvedValue({
      user: { id: 'user-disc', perfil: PerfilUsuario.DISCIPULO },
      response: null,
    })

    const response = await GET(requestFor('pastor'), { params: { perfil: 'pastor' } })
    expect(response.status).toBe(403)
  })
})
