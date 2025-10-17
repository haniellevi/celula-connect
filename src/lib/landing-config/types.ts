import type { HeroContent, LandingFeature, LandingTestimonial } from './parsers'

export interface LandingPreviewPlanFeature {
  name: string
  description: string | null
  included: boolean
}

export interface LandingPreviewPlanCta {
  type: string | null
  label: string | null
  url: string | null
}

export interface LandingPreviewPlan {
  id: string
  clerkId: string | null
  name: string
  description: string | null
  credits: number
  currency: string | null
  priceMonthlyCents: number | null
  priceYearlyCents: number | null
  highlight: boolean
  badge: string | null
  cta: LandingPreviewPlanCta
  billingSource: string | null
  features: LandingPreviewPlanFeature[] | null
}

export interface LandingPreviewPayload {
  hero: HeroContent
  features: LandingFeature[]
  testimonials: LandingTestimonial[]
  plans: LandingPreviewPlan[]
  generatedAt: string
}
