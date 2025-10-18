import { NextResponse } from 'next/server'
import { GET } from '@/app/api/admin/dashboard/route'
import { db } from '@/lib/db'
import { requireAdminAccess } from '@/lib/admin-utils'

jest.mock('@/lib/admin-utils', () => ({
  requireAdminAccess: jest.fn(),
}))

const adminUtilsMock = require('@/lib/admin-utils') as {
  requireAdminAccess: jest.MockedFunction<typeof requireAdminAccess>
}

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    adminUtilsMock.requireAdminAccess.mockResolvedValue({ userId: 'admin-id', response: null })
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

  it('retorna 401 quando o acesso é negado', async () => {
    adminUtilsMock.requireAdminAccess.mockResolvedValueOnce({
      userId: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET()
    expect(response.status).toBe(401)
  })
})
