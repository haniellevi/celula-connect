import { NextResponse } from 'next/server'
import { POST as createSolicitacaoRoute } from '@/app/api/trilhas/[trilhaId]/solicitacoes/route'
import { PATCH as updateSolicitacaoRoute } from '@/app/api/trilhas/solicitacoes/[id]/route'
import { GET as listSolicitacoesRoute } from '@/app/api/trilhas/solicitacoes/route'
import { PerfilUsuario, StatusSolicitacao } from '../../../prisma/generated/client'
import {
  createSolicitacaoTrilha,
  updateSolicitacaoTrilha,
  getSolicitacaoTrilhaById,
  listSolicitacoesTrilha,
} from '@/lib/queries/trilhas'
import {
  notifyTrilhaSolicitacaoCreated,
  notifyTrilhaSolicitacaoStatusChanged,
} from '@/lib/services/trilha-notifications'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  unauthorizedResponse: jest.fn(),
  hasRole: jest.fn(),
}))

jest.mock('@/lib/queries/trilhas', () => ({
  createSolicitacaoTrilha: jest.fn(),
  updateSolicitacaoTrilha: jest.fn(),
  getSolicitacaoTrilhaById: jest.fn(),
  listSolicitacoesTrilha: jest.fn(),
}))

jest.mock('@/lib/services/trilha-notifications', () => ({
  notifyTrilhaSolicitacaoCreated: jest.fn(),
  notifyTrilhaSolicitacaoStatusChanged: jest.fn(),
}))

const { requireDomainUser, unauthorizedResponse, hasRole } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  unauthorizedResponse: jest.Mock
  hasRole: jest.Mock
}
const { listSolicitacoesTrilha: listSolicitacoesTrilhaMock } = require('@/lib/queries/trilhas') as {
  listSolicitacoesTrilha: jest.Mock
}
const { notifyTrilhaSolicitacaoCreated: notifyCreatedMock, notifyTrilhaSolicitacaoStatusChanged: notifyStatusMock } =
  require('@/lib/services/trilha-notifications') as {
    notifyTrilhaSolicitacaoCreated: jest.Mock
    notifyTrilhaSolicitacaoStatusChanged: jest.Mock
  }

describe('/api/trilhas/[trilhaId]/solicitacoes', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    unauthorizedResponse.mockReset()
    hasRole.mockReset()
    ;(createSolicitacaoTrilha as jest.Mock).mockReset()
    notifyCreatedMock.mockReset()
    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('permite criação quando líder envia solicitação', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(createSolicitacaoTrilha as jest.Mock).mockResolvedValue({
      id: 'nova-solicitacao',
      status: StatusSolicitacao.PENDENTE,
      usuarioId: 'seed-user-lider',
      trilhaId: 'seed-trilha',
      liderSolicitanteId: 'seed-user-lider',
      areaSupervisaoId: 'area-01',
      usuario: { nome: 'Lucas Líder Seed' },
      trilha: { titulo: 'Formação de Líderes' },
      liderSolicitante: { nome: 'Lucas Líder Seed' },
      area: { nome: 'Área Central', supervisorId: 'seed-user-supervisor', igrejaId: 'seed-igreja-central' },
      supervisorResponsavel: null,
      motivo: 'Pronto para avançar',
    })

    const response = await createSolicitacaoRoute(
      new Request('http://localhost/api/trilhas/seed-trilha/solicitacoes', {
        method: 'POST',
        body: JSON.stringify({
          areaSupervisaoId: 'area-01',
          motivo: 'Pronto para avançar',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { trilhaId: 'seed-trilha' } },
    )

    expect(createSolicitacaoTrilha).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 'seed-user-lider',
        trilhaId: 'seed-trilha',
        areaSupervisaoId: 'area-01',
        liderSolicitanteId: 'seed-user-lider',
        motivo: 'Pronto para avançar',
        status: StatusSolicitacao.PENDENTE,
        dataSolicitacao: expect.any(Date),
      }),
      expect.objectContaining({ usuario: true }),
    )
    expect(response.status).toBe(201)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.data).toEqual(
      expect.objectContaining({
        id: 'nova-solicitacao',
        status: StatusSolicitacao.PENDENTE,
      }),
    )
    expect(notifyCreatedMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nova-solicitacao', status: StatusSolicitacao.PENDENTE }),
    )
  })

  it('bloqueia discípulo ao enviar solicitação para outro usuário', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-discipulo', perfil: PerfilUsuario.DISCIPULO },
      response: null,
    })
    hasRole.mockReturnValue(true)

    const response = await createSolicitacaoRoute(
      new Request('http://localhost/api/trilhas/seed-trilha/solicitacoes', {
        method: 'POST',
        body: JSON.stringify({
          areaSupervisaoId: 'area-01',
          motivo: 'Quero avançar',
          usuarioId: 'outro-usuario',
          liderSolicitanteId: 'seed-user-lider',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { trilhaId: 'seed-trilha' } },
    )

    expect(response.status).toBe(403)
    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(createSolicitacaoTrilha).not.toHaveBeenCalled()
  })
})

describe('/api/trilhas/solicitacoes/[id]', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    unauthorizedResponse.mockReset()
    hasRole.mockReset()
    ;(updateSolicitacaoTrilha as jest.Mock).mockReset()
    ;(getSolicitacaoTrilhaById as jest.Mock).mockReset()
    listSolicitacoesTrilhaMock.mockReset()
    notifyStatusMock.mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('permite supervisor aprovar solicitação', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-supervisor', perfil: PerfilUsuario.SUPERVISOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    ;(getSolicitacaoTrilhaById as jest.Mock).mockResolvedValue({
      id: 'seed-solicitacao',
      status: StatusSolicitacao.PENDENTE,
    })
    ;(updateSolicitacaoTrilha as jest.Mock).mockResolvedValue({
      id: 'seed-solicitacao',
      status: StatusSolicitacao.APROVADA,
      usuarioId: 'seed-user-discipulo',
      liderSolicitanteId: 'seed-user-lider',
      areaSupervisaoId: 'seed-area-trilha-central',
      usuario: { nome: 'Daniela Discípula Seed' },
      trilha: { titulo: 'Fundamentos da Fé' },
      liderSolicitante: { nome: 'Fernanda Líder Seed' },
      area: { igrejaId: 'seed-igreja-central', supervisorId: 'seed-user-supervisor' },
      supervisorResponsavel: { nome: 'Sara Supervisora Seed' },
      observacoesSupervisor: 'Aprovado com sucesso',
    })

    const response = await updateSolicitacaoRoute(
      new Request('http://localhost/api/trilhas/solicitacoes/seed-solicitacao', {
        method: 'PATCH',
        body: JSON.stringify({
          status: StatusSolicitacao.APROVADA,
          observacoesSupervisor: 'Aprovado com sucesso',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'seed-solicitacao' } },
    )

    expect(updateSolicitacaoTrilha).toHaveBeenCalledWith(
      'seed-solicitacao',
      expect.objectContaining({
        status: StatusSolicitacao.APROVADA,
        dataResposta: expect.any(Date),
        supervisorResponsavelId: 'seed-user-supervisor',
        observacoesSupervisor: 'Aprovado com sucesso',
      }),
      expect.objectContaining({ usuario: true }),
    )
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.data).toEqual(
      expect.objectContaining({
        id: 'seed-solicitacao',
        status: StatusSolicitacao.APROVADA,
      }),
    )
    expect(notifyStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'seed-solicitacao', status: StatusSolicitacao.APROVADA }),
    )
  })

  it('nega atualização para perfis sem permissão', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(false)
    notifyStatusMock.mockReset()

    const response = await updateSolicitacaoRoute(
      new Request('http://localhost/api/trilhas/solicitacoes/seed-solicitacao', {
        method: 'PATCH',
        body: JSON.stringify({ status: StatusSolicitacao.APROVADA }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'seed-solicitacao' } },
    )

    expect(response.status).toBe(403)
    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(updateSolicitacaoTrilha).not.toHaveBeenCalled()
    expect(notifyStatusMock).not.toHaveBeenCalled()
  })
})

describe('/api/trilhas/solicitacoes (GET)', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    unauthorizedResponse.mockReset()
    hasRole.mockReset()
    listSolicitacoesTrilhaMock.mockReset()

    unauthorizedResponse.mockImplementation(() =>
      NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 }),
    )
  })

  it('retorna solicitações do líder autenticado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(true)
    listSolicitacoesTrilhaMock.mockResolvedValue([
      { id: 'sol-1', status: StatusSolicitacao.PENDENTE },
    ])

    const response = await listSolicitacoesRoute(new Request('http://localhost/api/trilhas/solicitacoes'))

    expect(listSolicitacoesTrilhaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        liderSolicitanteId: 'seed-user-lider',
        include: expect.objectContaining({ usuario: true, trilha: true }),
      }),
    )
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data).toEqual([
      { id: 'sol-1', status: StatusSolicitacao.PENDENTE },
    ])
  })

  it('aplica filtro por trilha quando informado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-supervisor', perfil: PerfilUsuario.SUPERVISOR },
      response: null,
    })
    hasRole.mockReturnValue(true)
    listSolicitacoesTrilhaMock.mockResolvedValue([])

    await listSolicitacoesRoute(
      new Request('http://localhost/api/trilhas/solicitacoes?trilhaId=seed-trilha-fundamentos'),
    )

    expect(listSolicitacoesTrilhaMock).toHaveBeenCalledWith(
      expect.objectContaining({ trilhaId: 'seed-trilha-fundamentos' }),
    )
  })

  it('nega acesso quando perfil não autorizado', async () => {
    requireDomainUser.mockResolvedValue({
      user: { id: 'seed-user-lider', perfil: PerfilUsuario.LIDER_CELULA },
      response: null,
    })
    hasRole.mockReturnValue(false)

    const response = await listSolicitacoesRoute(new Request('http://localhost/api/trilhas/solicitacoes'))

    expect(response.status).toBe(403)
    expect(unauthorizedResponse).toHaveBeenCalled()
    expect(listSolicitacoesTrilhaMock).not.toHaveBeenCalled()
  })
})
