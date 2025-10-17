"use server";

import { NextResponse } from 'next/server'
import { withApiLogging } from '@/lib/logging/api'
import { getActivePlansSorted } from '@/lib/queries/plans'
import { listLandingPageConfig } from '@/lib/queries/settings'
import { extractFeatures, extractHeroContent, extractTestimonials } from '@/lib/landing-config/parsers'
import type { LandingPreviewPlan } from '@/lib/landing-config/types'

async function handleGet() {
  const [plans, heroConfig, featuresConfig, testimonialsConfig] = await Promise.all([
    getActivePlansSorted(),
    listLandingPageConfig('hero'),
    listLandingPageConfig('features'),
    listLandingPageConfig('testimonials'),
  ])

  const hero = extractHeroContent(heroConfig)
  const features = extractFeatures(featuresConfig)
  const testimonials = extractTestimonials(testimonialsConfig)

  const plansPayload: LandingPreviewPlan[] = plans.map((plan) => ({
    id: plan.id,
    clerkId: plan.clerkId ?? null,
    name: plan.name,
    description: plan.description ?? null,
    credits: plan.credits,
    currency: plan.currency ?? null,
    priceMonthlyCents: plan.priceMonthlyCents ?? null,
    priceYearlyCents: plan.priceYearlyCents ?? null,
    highlight: plan.highlight ?? false,
    badge: plan.badge ?? null,
    cta: {
      type: plan.ctaType ?? null,
      label: plan.ctaLabel ?? null,
      url: plan.ctaUrl ?? null,
    },
    billingSource: plan.billingSource ?? null,
    features: Array.isArray(plan.features)
      ? plan.features.map((feature) => {
          if (feature && typeof feature === 'object') {
            const record = feature as { name?: string; description?: string; included?: boolean }
            return {
              name: record.name ?? '',
              description: record.description ?? null,
              included: record.included ?? true,
            }
          }
          return {
            name: String(feature ?? ''),
            description: null,
            included: true,
          }
        })
      : null,
  }))

  return NextResponse.json({
    data: {
      hero,
      features,
      testimonials,
      plans: plansPayload,
      generatedAt: new Date().toISOString(),
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/public/landing-preview',
  feature: 'landing_config_public',
})
