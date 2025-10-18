import { NextResponse } from 'next/server'
import { PUT } from '@/app/api/admin/credits/[id]/route'
import { requireAdminAccess } from '@/lib/admin-utils'
import { syncClerkCreditsMetadata } from '@/lib/clerk/credit-metadata'

jest.mock('@/lib/admin-utils', () => ({
  requireAdminAccess: jest.fn(),
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
const adminUtilsMock = require('@/lib/admin-utils') as {
  requireAdminAccess: jest.MockedFunction<typeof requireAdminAccess>
}

describe('PUT /api/admin/credits/[id]', () => {
  const request = (payload: unknown) =>
    new Request('http://localhost/api/admin/credits/credit-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

  beforeEach(() => {
    jest.resetAllMocks()
    adminUtilsMock.requireAdminAccess.mockResolvedValue({ userId: 'admin-user', response: null })
  })

  it('atualiza o saldo e sincroniza metadata do Clerk', async () => {
    const balance = {
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 10,
      lastSyncedAt: new Date('2025-10-16T10:00:00Z'),
    }

    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    const updateMock = db.creditBalance.update as jest.Mock
    const usageMock = db.usageHistory.create as jest.Mock

    findUniqueMock.mockResolvedValue(balance as any)
    updateMock.mockResolvedValue({
      ...balance,
      creditsRemaining: 25,
      lastSyncedAt: new Date('2025-10-16T10:05:00Z'),
    } as any)
    usageMock.mockResolvedValue({ id: 'usage-1' } as any)
    ;(syncClerkCreditsMetadata as jest.Mock).mockResolvedValue({})

    const response = await PUT(request({ adjustment: 15 }), { params: { id: 'balance-1' } })

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
    expect(usageMock).toHaveBeenCalled()
  })

  it('retorna metadataSynced=false quando sincronização falha', async () => {
    const balance = {
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 10,
      lastSyncedAt: new Date('2025-10-16T10:00:00Z'),
    }

    const findUniqueMock = db.creditBalance.findUnique as jest.Mock
    const updateMock = db.creditBalance.update as jest.Mock
    const usageMock = db.usageHistory.create as jest.Mock

    findUniqueMock.mockResolvedValue(balance as any)
    updateMock.mockResolvedValue({
      ...balance,
      creditsRemaining: 5,
      lastSyncedAt: new Date('2025-10-16T10:10:00Z'),
    } as any)
    usageMock.mockResolvedValue({ id: 'usage-2' } as any)
    ;(syncClerkCreditsMetadata as jest.Mock).mockRejectedValue(new Error('Clerk offline'))

    const response = await PUT(request({ adjustment: -5 }), { params: { id: 'balance-1' } })
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.metadataSynced).toBe(false)
  })

  it('bloqueia requisições não autenticadas', async () => {
    adminUtilsMock.requireAdminAccess.mockResolvedValueOnce({
      userId: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await PUT(request({ adjustment: 5 }), { params: { id: 'balance-1' } })
    expect(response.status).toBe(401)
  })
})
