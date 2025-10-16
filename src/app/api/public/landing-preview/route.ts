"use server";

import { NextResponse } from 'next/server'
import { withApiLogging } from '@/lib/logging/api'
import { getActivePlansSorted } from '@/lib/queries/plans'
import { listLandingPageConfig } from '@/lib/queries/settings'
import { extractFeatures, extractHeroContent, extractTestimonials } from '@/lib/landing-config/parsers'

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

  return NextResponse.json({
    data: {
      hero,
      features,
      testimonials,
      plans: plans.map((plan) => ({
        id: plan.id,
        clerkId: plan.clerkId,
        name: plan.name,
        description: plan.description,
        credits: plan.credits,
        currency: plan.currency,
        priceMonthlyCents: plan.priceMonthlyCents,
        priceYearlyCents: plan.priceYearlyCents,
        highlight: plan.highlight,
        badge: plan.badge,
        cta: {
          type: plan.ctaType,
          label: plan.ctaLabel,
          url: plan.ctaUrl,
        },
        billingSource: plan.billingSource,
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
      })),
      generatedAt: new Date().toISOString(),
    },
  })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/public/landing-preview',
  feature: 'landing_config_public',
})
