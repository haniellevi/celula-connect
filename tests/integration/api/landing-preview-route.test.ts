import { GET } from '@/app/api/public/landing-preview/route'

jest.mock('@/lib/queries/plans', () => ({
  getActivePlansSorted: jest.fn(),
}))

jest.mock('@/lib/queries/settings', () => ({
  listLandingPageConfig: jest.fn(),
}))

const { getActivePlansSorted } = require('@/lib/queries/plans') as {
  getActivePlansSorted: jest.Mock
}

const { listLandingPageConfig } = require('@/lib/queries/settings') as {
  listLandingPageConfig: jest.Mock
}

describe('GET /api/public/landing-preview', () => {
  beforeEach(() => {
    getActivePlansSorted.mockReset()
    listLandingPageConfig.mockReset()
  })

  it('agrega hero, features, depoimentos e planos para o preview', async () => {
    getActivePlansSorted.mockResolvedValue([
      {
        id: 'seed-plan-basico',
        clerkId: 'plan_basic',
        name: 'Plano Básico',
        description: 'Ideal para igrejas em início de expansão.',
        credits: 500,
        currency: 'BRL',
        priceMonthlyCents: 9900,
        priceYearlyCents: 99900,
        highlight: true,
        badge: 'Mais popular',
        ctaType: 'checkout',
        ctaLabel: 'Assinar agora',
        ctaUrl: '/subscribe',
        billingSource: 'clerk',
        features: [
          { name: 'Até 50 usuários', description: 'Inclui líderes e supervisores.', included: true },
        ],
      },
    ])

    listLandingPageConfig.mockImplementation(async (section?: string) => {
      if (section === 'hero') {
        return [
          { chave: 'headline', valor: 'Transforme sua rede de células em comunidade vibrante.' },
          { chave: 'cta_label', valor: 'Comece agora' },
        ]
      }
      if (section === 'features') {
        return [
          { chave: 'feature_1_title', valor: 'Gestão centralizada' },
          { chave: 'feature_1_description', valor: 'Monitore redes, líderes e células em um só lugar.' },
          { chave: 'feature_2_title', valor: 'Trilhas guiadas' },
          { chave: 'feature_2_description', valor: 'Fluxos completos de aprovação para novos líderes.' },
        ]
      }
      if (section === 'testimonials') {
        return [
          { chave: 'testimonial_1_name', valor: 'Pr. Ricardo Souza' },
          { chave: 'testimonial_1_role', valor: 'Pastor titular, Igreja Vida Plena' },
          { chave: 'testimonial_1_quote', valor: 'Automatizamos relatórios e liberamos tempo para pastorear.' },
        ]
      }
      return []
    })

    const response = await GET(new Request('http://localhost/api/public/landing-preview'))

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.hero).toEqual({
      headline: 'Transforme sua rede de células em comunidade vibrante.',
      cta_label: 'Comece agora',
    })
    expect(payload.data.features).toEqual([
      {
        title: 'Gestão centralizada',
        description: 'Monitore redes, líderes e células em um só lugar.',
      },
      {
        title: 'Trilhas guiadas',
        description: 'Fluxos completos de aprovação para novos líderes.',
      },
    ])
    expect(payload.data.testimonials).toEqual([
      {
        name: 'Pr. Ricardo Souza',
        role: 'Pastor titular, Igreja Vida Plena',
        quote: 'Automatizamos relatórios e liberamos tempo para pastorear.',
      },
    ])
    expect(payload.data.plans).toHaveLength(1)
    expect(payload.data.generatedAt).toBeDefined()
  })

  it('retorna coleções vazias quando não existem dados configurados', async () => {
    getActivePlansSorted.mockResolvedValue([])
    listLandingPageConfig.mockResolvedValue([])

    const response = await GET(new Request('http://localhost/api/public/landing-preview'))

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.hero).toEqual({})
    expect(payload.data.features).toEqual([])
    expect(payload.data.testimonials).toEqual([])
    expect(payload.data.plans).toEqual([])
    expect(typeof payload.data.generatedAt).toBe('string')
  })

  it('normaliza múltiplos planos com CTAs e features heterogêneos', async () => {
    getActivePlansSorted.mockResolvedValue([
      {
        id: 'plan-a',
        clerkId: null,
        name: 'Essencial',
        description: null,
        credits: 250,
        currency: 'BRL',
        priceMonthlyCents: 4900,
        priceYearlyCents: null,
        highlight: false,
        badge: null,
        ctaType: 'checkout',
        ctaLabel: 'Assinar',
        ctaUrl: '/checkout/plan-a',
        billingSource: null,
        features: [
          { name: 'Gestão de células', description: null, included: true },
          'Suporte por e-mail',
        ],
      },
      {
        id: 'plan-b',
        clerkId: 'sk_plan_b',
        name: 'Premium',
        description: 'Inclui todas as integrações.',
        credits: 1000,
        currency: null,
        priceMonthlyCents: null,
        priceYearlyCents: 39900,
        highlight: true,
        badge: 'Mais completo',
        ctaType: null,
        ctaLabel: null,
        ctaUrl: null,
        billingSource: 'clerk',
        features: [],
      },
    ])

    listLandingPageConfig.mockImplementation(async (section?: string) => {
      if (section === 'hero') {
        return [{ chave: 'headline', valor: 'Headline configurada' }]
      }
      return []
    })

    const response = await GET(new Request('http://localhost/api/public/landing-preview'))

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.data.plans).toEqual([
      {
        id: 'plan-a',
        clerkId: null,
        name: 'Essencial',
        description: null,
        credits: 250,
        currency: 'BRL',
        priceMonthlyCents: 4900,
        priceYearlyCents: null,
        highlight: false,
        badge: null,
        cta: {
          type: 'checkout',
          label: 'Assinar',
          url: '/checkout/plan-a',
        },
        billingSource: null,
        features: [
          {
            name: 'Gestão de células',
            description: null,
            included: true,
          },
          {
            name: 'Suporte por e-mail',
            description: null,
            included: true,
          },
        ],
      },
      {
        id: 'plan-b',
        clerkId: 'sk_plan_b',
        name: 'Premium',
        description: 'Inclui todas as integrações.',
        credits: 1000,
        currency: null,
        priceMonthlyCents: null,
        priceYearlyCents: 39900,
        highlight: true,
        badge: 'Mais completo',
        cta: {
          type: null,
          label: null,
          url: null,
        },
        billingSource: 'clerk',
        features: [],
      },
    ])
    expect(payload.data.hero).toEqual({ headline: 'Headline configurada' })
  })
})
