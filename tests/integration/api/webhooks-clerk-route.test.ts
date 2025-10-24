import { POST } from '@/app/api/webhooks/clerk/route'
import type { WebhookEvent } from '@clerk/nextjs/server'

jest.mock('svix', () => ({
  Webhook: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    usuario: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    creditBalance: {
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    subscriptionEvent: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/credits/validate-credits', () => ({
  refreshUserCredits: jest.fn(),
  addUserCredits: jest.fn(),
}))

jest.mock('@/lib/credits/settings', () => ({
  getPlanCredits: jest.fn(),
}))

jest.mock('@/lib/clerk/credit-packs', () => ({
  getCreditsForPrice: jest.fn(),
}))

const { Webhook } = require('svix') as { Webhook: jest.Mock }
const { headers } = require('next/headers') as { headers: jest.Mock }
const { db } = require('@/lib/db') as {
  db: {
    user: { findUnique: jest.Mock }
    subscriptionEvent: { create: jest.Mock }
  }
}
const { refreshUserCredits, addUserCredits } = require('@/lib/credits/validate-credits') as {
  refreshUserCredits: jest.Mock
  addUserCredits: jest.Mock
}
const { getPlanCredits } = require('@/lib/credits/settings') as {
  getPlanCredits: jest.Mock
}
const { getCreditsForPrice } = require('@/lib/clerk/credit-packs') as {
  getCreditsForPrice: jest.Mock
}

describe('/api/webhooks/clerk', () => {
  let verifyMock: jest.Mock

  beforeAll(() => {
    process.env.CLERK_WEBHOOK_SECRET = 'test_secret'
  })

  beforeEach(() => {
    verifyMock = jest.fn()
    Webhook.mockImplementation(() => ({
      verify: verifyMock,
    }))
    process.env.CREDITS_ENABLED = '1'

    headers.mockResolvedValue({
      get: (key: string) =>
        ({
          'svix-id': 'evt_1',
          'svix-timestamp': '123456789',
          'svix-signature': 'signature',
        } as Record<string, string | null>)[key] ?? null,
    })

    db.user.findUnique.mockResolvedValue({ id: 'db-user-1' })
    db.subscriptionEvent.create.mockResolvedValue({})

    refreshUserCredits.mockReset()
    addUserCredits.mockReset()
    getPlanCredits.mockReset()
    getCreditsForPrice.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('atualiza créditos quando assinatura ativa é sincronizada', async () => {
    const event: WebhookEvent = {
      type: 'subscription.updated',
      data: {
        id: 'sub_123',
        user_id: 'user_123',
        status: 'active',
        plan_id: 'cplan_pro',
        updated_at: Date.now(),
      },
    } as unknown as WebhookEvent

    verifyMock.mockReturnValue(event)
    getPlanCredits.mockResolvedValueOnce(250)

    const response = await POST(
      new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    expect(response.status).toBe(200)
    expect(getPlanCredits).toHaveBeenCalledWith('cplan_pro')
    expect(refreshUserCredits).toHaveBeenCalledWith('user_123', 250, { skipClerkUpdate: true })
  })

  it('acumula créditos adicionais em compras one-off', async () => {
    const event: WebhookEvent = {
      type: 'invoice.payment_succeeded',
      data: {
        customer_id: 'user_987',
        lines: [{ price_id: 'price_small_pack' }],
      },
    } as unknown as WebhookEvent

    verifyMock.mockReturnValue(event)
    getCreditsForPrice.mockImplementation((priceId: string) =>
      priceId === 'price_small_pack' ? 100 : 0,
    )
    addUserCredits.mockResolvedValue(200)

    const response = await POST(
      new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    expect(response.status).toBe(200)
    expect(addUserCredits).toHaveBeenCalledWith('user_987', 100)
  })

  it('não toca em saldo quando créditos estão desativados', async () => {
    process.env.CREDITS_ENABLED = '0'

    const event: WebhookEvent = {
      type: 'subscription.updated',
      data: {
        id: 'sub_disabled',
        user_id: 'user_disabled',
        status: 'active',
        plan_id: 'cplan_disabled',
        updated_at: Date.now(),
      },
    } as unknown as WebhookEvent

    verifyMock.mockReturnValue(event)

    const response = await POST(
      new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    expect(response.status).toBe(200)
    expect(getPlanCredits).not.toHaveBeenCalled()
    expect(refreshUserCredits).not.toHaveBeenCalled()
    expect(addUserCredits).not.toHaveBeenCalled()
  })
})
