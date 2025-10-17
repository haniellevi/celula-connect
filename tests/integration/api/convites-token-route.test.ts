import { GET } from '@/app/api/public/convites/[token]/route'

jest.mock('@/lib/queries/convites', () => ({
  getConviteByToken: jest.fn(),
  registerConviteView: jest.fn(),
}))

const { getConviteByToken, registerConviteView } = require('@/lib/queries/convites') as {
  getConviteByToken: jest.Mock
  registerConviteView: jest.Mock
}

describe('GET /api/public/convites/[token]', () => {
  beforeEach(() => {
    getConviteByToken.mockReset()
    registerConviteView.mockReset()
    registerConviteView.mockResolvedValue({ id: 'seed-convite', totalVisualizacoes: 1 })
  })

  it('retorna 410 para convite expirado e registra visualização', async () => {
    const expirado = new Date(Date.now() - 1000 * 60)
    getConviteByToken.mockResolvedValue({
      id: 'seed-convite-expirado',
      tokenConvite: 'EXPIRADO123',
      dataExpiracao: expirado,
      usado: false,
      nomeConvidado: 'Convidado Expirado',
      emailConvidado: 'expirado@example.com',
      cargo: 'MEMBRO',
      celulaId: 'seed-celula',
      totalVisualizacoes: 3,
      totalAcessosValidos: 2,
    })

    const response = await GET(
      new Request('http://localhost/api/public/convites/EXPIRADO123', { method: 'GET' }),
      { params: { token: 'EXPIRADO123' } },
    )

    expect(response.status).toBe(410)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Convite expirado' })
    expect(registerConviteView).toHaveBeenCalledWith('EXPIRADO123', 'expired')
  })

  it('retorna 410 para convite já utilizado e registra visualização', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60)
    getConviteByToken.mockResolvedValue({
      id: 'seed-convite-usado',
      tokenConvite: 'USADO123',
      dataExpiracao: futureDate,
      usado: true,
      nomeConvidado: 'Convidado Usado',
      emailConvidado: 'usado@example.com',
      cargo: 'MEMBRO',
      celulaId: 'seed-celula',
      totalVisualizacoes: 7,
      totalAcessosValidos: 6,
    })

    const response = await GET(
      new Request('http://localhost/api/public/convites/USADO123', { method: 'GET' }),
      { params: { token: 'USADO123' } },
    )

    expect(response.status).toBe(410)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'Convite já utilizado' })
    expect(registerConviteView).toHaveBeenCalledWith('USADO123', 'used')
  })

  it('retorna dados enriquecidos para convite válido e incrementa métricas', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60)
    getConviteByToken.mockResolvedValue({
      id: 'seed-convite-valido',
      tokenConvite: 'VALIDO123',
      dataExpiracao: futureDate,
      usado: false,
      nomeConvidado: 'Convidado Válido',
      emailConvidado: 'valido@example.com',
      cargo: 'MEMBRO',
      celulaId: 'seed-celula',
      totalVisualizacoes: 5,
      totalAcessosValidos: 4,
      celula: {
        id: 'seed-celula',
        nome: 'Célula Seed',
        igrejaId: 'seed-igreja',
        igreja: {
          id: 'seed-igreja',
          nome: 'Igreja Seed',
        },
      },
    })

    const response = await GET(
      new Request('http://localhost/api/public/convites/VALIDO123?includeCelula=true&includeIgreja=true', {
        method: 'GET',
      }),
      { params: { token: 'VALIDO123' } },
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.nomeConvidado).toBe('Convidado Válido')
    expect(payload.data.totalVisualizacoes).toBe(6)
    expect(payload.data.totalAcessosValidos).toBe(5)
    expect(registerConviteView).toHaveBeenCalledWith('VALIDO123', 'valid')
  })
})
