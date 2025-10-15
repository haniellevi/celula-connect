import { GET } from '@/app/api/public/landing-config/route'

jest.mock('@/lib/queries/settings', () => ({
  listLandingPageConfig: jest.fn(),
}))

const { listLandingPageConfig } = require('@/lib/queries/settings') as {
  listLandingPageConfig: jest.Mock
}

describe('GET /api/public/landing-config', () => {
  beforeEach(() => {
    listLandingPageConfig.mockReset()
  })

  it('retorna configurações públicas da landing page', async () => {
    listLandingPageConfig.mockResolvedValue([
      { secao: 'hero', chave: 'headline', valor: 'Bem-vindo' },
    ])

    const response = await GET(new Request('http://localhost/api/public/landing-config'))

    expect(listLandingPageConfig).toHaveBeenCalledWith(undefined)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data).toHaveLength(1)
  })
})
