import { refreshUserCredits } from '@/lib/credits/validate-credits'
import { getUserFromClerkId } from '@/lib/auth-utils'
import { syncClerkCreditsMetadata } from '@/lib/clerk/credit-metadata'

jest.mock('@/lib/auth-utils', () => ({
  getUserFromClerkId: jest.fn(),
}))

jest.mock('@/lib/clerk/credit-metadata', () => ({
  syncClerkCreditsMetadata: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    creditBalance: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

const { db } = require('@/lib/db') as {
  db: {
    creditBalance: { findUnique: jest.Mock; create: jest.Mock; upsert: jest.Mock }
  }
}

describe('refreshUserCredits', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.CREDITS_ENABLED = '1'
    ;(getUserFromClerkId as jest.Mock).mockResolvedValue({
      id: 'user-1',
      clerkUserId: 'clerk_123',
    })
  })

  it('upsert saldo existente e sincroniza metadata do Clerk', async () => {
    const timestamp = new Date('2025-10-17T12:00:00Z')
    ;(db.creditBalance.findUnique as jest.Mock).mockResolvedValue({
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 20,
    })
    ;(db.creditBalance.upsert as jest.Mock).mockResolvedValue({
      id: 'balance-1',
      userId: 'user-1',
      clerkUserId: 'clerk_123',
      creditsRemaining: 50,
      lastSyncedAt: timestamp,
    })
    ;(syncClerkCreditsMetadata as jest.Mock).mockResolvedValue({})

    await refreshUserCredits('clerk_123', 50, {
      creditsTotal: 200,
      planId: 'cplan_pro',
      lastSyncedAt: timestamp,
    })

    expect(db.creditBalance.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      update: {
        creditsRemaining: 50,
        lastSyncedAt: timestamp,
      },
      create: {
        userId: 'user-1',
        clerkUserId: 'clerk_123',
        creditsRemaining: 50,
        lastSyncedAt: timestamp,
      },
    })
    expect(syncClerkCreditsMetadata).toHaveBeenCalledWith('clerk_123', 50, {
      creditsTotal: 200,
      planId: 'cplan_pro',
      lastSyncedAt: timestamp,
    })
  })

  it('cria saldo quando inexistente e respeita skipClerkUpdate', async () => {
    const timestamp = new Date('2025-10-17T15:00:00Z')
    ;(db.creditBalance.findUnique as jest.Mock).mockResolvedValue(null)
    ;(db.creditBalance.create as jest.Mock).mockResolvedValue({
      id: 'balance-2',
      userId: 'user-1',
      clerkUserId: 'clerk_456',
      creditsRemaining: 0,
    })
    ;(db.creditBalance.upsert as jest.Mock).mockResolvedValue({
      id: 'balance-2',
      userId: 'user-1',
      clerkUserId: 'clerk_456',
      creditsRemaining: 30,
      lastSyncedAt: timestamp,
    })

    await refreshUserCredits('clerk_456', 30, {
      skipClerkUpdate: true,
      lastSyncedAt: timestamp,
    })

    expect(db.creditBalance.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        clerkUserId: 'clerk_456',
        creditsRemaining: 0,
      },
    })
    expect(db.creditBalance.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      update: {
        creditsRemaining: 30,
        lastSyncedAt: timestamp,
      },
      create: {
        userId: 'user-1',
        clerkUserId: 'clerk_456',
        creditsRemaining: 30,
        lastSyncedAt: timestamp,
      },
    })
    expect(syncClerkCreditsMetadata).not.toHaveBeenCalled()
  })

  it('propaga erro quando sincronização do Clerk falha', async () => {
    const timestamp = new Date('2025-10-17T18:00:00Z')
    ;(db.creditBalance.findUnique as jest.Mock).mockResolvedValue({
      id: 'balance-3',
      userId: 'user-1',
      clerkUserId: 'clerk_789',
      creditsRemaining: 40,
    })
    ;(db.creditBalance.upsert as jest.Mock).mockResolvedValue({
      id: 'balance-3',
      userId: 'user-1',
      clerkUserId: 'clerk_789',
      creditsRemaining: 10,
      lastSyncedAt: timestamp,
    })
    ;(syncClerkCreditsMetadata as jest.Mock).mockRejectedValue(new Error('Clerk indisponível'))

    await expect(
      refreshUserCredits('clerk_789', 10, { lastSyncedAt: timestamp }),
    ).rejects.toThrow('Clerk indisponível')
  })

  it('ignora sincronização quando créditos estão desativados', async () => {
    process.env.CREDITS_ENABLED = '0'

    await refreshUserCredits('clerk_disabled', 999, {})

    expect(db.creditBalance.findUnique).not.toHaveBeenCalled()
    expect(db.creditBalance.upsert).not.toHaveBeenCalled()
    expect(syncClerkCreditsMetadata).not.toHaveBeenCalled()
  })
})
