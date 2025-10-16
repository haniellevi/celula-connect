import { GET } from '@/app/api/admin/dashboard/route'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-utils'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/admin-utils', () => ({
  isAdmin: jest.fn(),
}))

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({ userId: 'admin-id' })
    ;(isAdmin as jest.Mock).mockResolvedValue(true)
  })

  it('retorna métricas agregadas do domínio', async () => {
    ;(db.usuario.count as jest.Mock) = jest.fn().mockResolvedValue(42)
    ;(db.celula.count as jest.Mock) = jest.fn().mockResolvedValue(8)
    ;(db.aviso.count as jest.Mock) = jest.fn().mockResolvedValue(5)
    ;(db.devocional.count as jest.Mock) = jest.fn().mockResolvedValue(3)
    ;(db.metaLeituraUsuario.count as jest.Mock) = jest.fn().mockResolvedValue(12)
    ;(db.leituraRegistro.findMany as jest.Mock) = jest
      .fn()
      .mockResolvedValue([
        { dataLeitura: new Date('2025-10-10T00:00:00Z') },
        { dataLeitura: new Date('2025-10-09T00:00:00Z') },
      ])
    ;(db.leituraRegistro.count as jest.Mock) = jest.fn().mockResolvedValue(4)

    const response = await GET()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.totalUsuarios).toBe(42)
    expect(json.totalCelulas).toBe(8)
    expect(json.avisosAtivos).toBe(5)
    expect(json.devocionaisAtivos).toBe(3)
    expect(json.metasAtivas).toBe(12)
    expect(Array.isArray(json.leiturasPorMes)).toBe(true)
  })
})
