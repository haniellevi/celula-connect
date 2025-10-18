import { PUT } from '@/app/api/admin/users/[id]/credits/route'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-utils'
import { syncClerkCreditsMetadata } from '@/lib/clerk/credit-metadata'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/admin-utils', () => ({
  isAdmin: jest.fn(),
}))

jest.mock('@/lib/clerk/credit-metadata', () => ({
  syncClerkCreditsMetadata: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    creditBalance: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usageHistory: {
      create: jest.fn(),
    },
  },
}))

const { db } = require('@/lib/db') as {
  db: {
    creditBalance: { findUnique: jest.Mock; update: jest.Mock }
    usageHistory: { create: jest.Mock }
  }
}

describe('PUT /api/admin/users/[id]/credits', () => {
  const request = (payload: unknown) =>
    new Request('http://localhost/api/admin/users/user-1/credits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

  beforeEach(() => {
    jest.resetAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({ userId: 'admin-user' })
    ;(isAdmin as jest.Mock).mockResolvedValue(true)
  })

  it('ajusta o saldo com base em adjustment e sincroniza metadata', async () => {
    const balance = {
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 10,
      lastSyncedAt: new Date('2025-10-17T10:00:00Z'),
    }

    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    const updateMock = db.creditBalance.update as jest.Mock
    const usageMock = db.usageHistory.create as jest.Mock

    findUniqueMock.mockResolvedValue(balance as any)
    updateMock.mockResolvedValue({
      ...balance,
      creditsRemaining: 25,
      lastSyncedAt: new Date('2025-10-17T10:05:00Z'),
    } as any)
    usageMock.mockResolvedValue({ id: 'usage-1' } as any)
    ;(syncClerkCreditsMetadata as jest.Mock).mockResolvedValue({})

    const response = await PUT(request({ adjustment: 15 }), { params: { id: 'user-1' } })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.creditsRemaining).toBe(25)
    expect(payload.metadataSynced).toBe(true)
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: expect.objectContaining({ creditsRemaining: 25 }),
    })
    expect(syncClerkCreditsMetadata).toHaveBeenCalledWith('clerk_123', 25, {
      lastSyncedAt: expect.any(Date),
    })
    expect(usageMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        creditsUsed: 15,
        details: expect.objectContaining({
          adminId: 'admin-user',
          type: 'admin_adjustment',
        }),
      }),
    })
  })

  it('aceita body com credits absolutos e retorna metadataSynced=false quando Clerk falha', async () => {
    const balance = {
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 5,
      lastSyncedAt: new Date('2025-10-17T11:00:00Z'),
    }

    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    const updateMock = db.creditBalance.update as jest.Mock

    findUniqueMock.mockResolvedValue(balance as any)
    updateMock.mockResolvedValue({
      ...balance,
      creditsRemaining: 40,
      lastSyncedAt: new Date('2025-10-17T11:02:00Z'),
    } as any)
    ;(syncClerkCreditsMetadata as jest.Mock).mockRejectedValue(new Error('Clerk offline'))
    ;(db.usageHistory.create as jest.Mock).mockResolvedValue({ id: 'usage-2' } as any)

    const response = await PUT(request({ credits: 40 }), { params: { id: 'user-1' } })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.creditsRemaining).toBe(40)
    expect(payload.metadataSynced).toBe(false)
  })

  it('retorna 400 quando body não contém número', async () => {
    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    findUniqueMock.mockResolvedValue({
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 10,
      lastSyncedAt: new Date('2025-10-17T12:30:00Z'),
    } as any)

    const response = await PUT(request({ credits: 'abc' }), { params: { id: 'user-1' } })
    expect(response.status).toBe(400)
    expect(db.creditBalance.update).not.toHaveBeenCalled()
  })

  it('bloqueia acesso de usuários não autorizados', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ userId: null })

    const response = await PUT(request({ credits: 10 }), { params: { id: 'user-1' } })
    expect(response.status).toBe(401)
  })

  it('retorna 404 quando o saldo não existe', async () => {
    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    findUniqueMock.mockResolvedValue(null)

    const response = await PUT(request({ credits: 10 }), { params: { id: 'user-1' } })
    expect(response.status).toBe(404)
  })
})
