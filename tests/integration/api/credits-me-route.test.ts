import { GET } from '@/app/api/credits/me/route'
import { auth } from '@clerk/nextjs/server'
import { getUserFromClerkId } from '@/lib/auth-utils'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/auth-utils', () => ({
  getUserFromClerkId: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    creditBalance: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const { db } = require('@/lib/db') as {
  db: {
    creditBalance: { findUnique: jest.Mock; create: jest.Mock }
  }
}

const request = new Request('http://localhost/api/credits/me')

describe('GET /api/credits/me', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('retorna 401 quando não autenticado', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ userId: null })

    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('retorna saldo existente do usuário', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(getUserFromClerkId as jest.Mock).mockResolvedValue({ id: 'user-1' })
    ;(db.creditBalance.findUnique as jest.Mock).mockResolvedValue({
      id: 'balance-1',
      userId: 'user-1',
      creditsRemaining: 42,
      lastSyncedAt: new Date('2025-10-18T10:00:00Z'),
    })

    const response = await GET(request)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual({
      creditsRemaining: 42,
      lastSyncedAt: expect.any(String),
    })
  })

  it('retorna saldo zerado quando inexistente', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ userId: 'clerk_456' })
    ;(getUserFromClerkId as jest.Mock).mockResolvedValue({ id: 'user-2' })
    ;(db.creditBalance.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await GET(request)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.creditsRemaining).toBe(0)
    expect(payload.lastSyncedAt).toBeNull()
    expect(db.creditBalance.create).not.toHaveBeenCalled()
  })
})
