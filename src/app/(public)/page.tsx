export const revalidate = 300

import { Hero } from '@/components/marketing/hero'
import { Pricing } from '@/components/marketing/pricing'
import { getActivePlansSorted } from '@/lib/queries/plans'
import { FAQ } from '@/components/marketing/faq'
import { AIStarter } from '@/components/marketing/ai-starter'
import { listLandingPageConfig } from '@/lib/queries/settings'
import { extractFeatures, extractHeroContent, extractTestimonials } from '@/lib/landing-config/parsers'

type PlanRecord = Awaited<ReturnType<typeof getActivePlansSorted>>[number]

type PlanFeatureConfig = {
  name?: string | null
  description?: string | null
  included?: boolean | null
}

const isPlanFeatureConfig = (value: unknown): value is PlanFeatureConfig => {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  if ('name' in record && record.name !== undefined && record.name !== null && typeof record.name !== 'string') {
    return false
  }
  if (
    'description' in record &&
    record.description !== undefined &&
    record.description !== null &&
    typeof record.description !== 'string'
  ) {
    return false
  }
  if ('included' in record && record.included !== undefined && typeof record.included !== 'boolean') {
    return false
  }
  return true
}

const isPlanFeatureArray = (value: unknown): value is PlanFeatureConfig[] =>
  Array.isArray(value) && value.every(isPlanFeatureConfig)

const mapPlanFeatures = (features: PlanRecord['features']) => {
  if (!isPlanFeatureArray(features)) {
    return null
  }

  const parsed = features.map((feature) => ({
    name: feature.name ?? '',
    description: feature.description ?? null,
    included: feature.included ?? true,
  }))

  return parsed.length > 0 ? parsed : null
}

export default async function LandingPage() {
  const [plans, heroConfig, featuresConfig, testimonialsConfig] = await Promise.all([
    getActivePlansSorted(),
    listLandingPageConfig('hero'),
    listLandingPageConfig('features'),
    listLandingPageConfig('testimonials'),
  ])
  const heroSettings = extractHeroContent(heroConfig)
  const featureHighlights = extractFeatures(featuresConfig)
  const testimonials = extractTestimonials(testimonialsConfig)

  return (
    <main className="min-h-screen">
      <Hero
        headline={heroSettings.headline}
        ctaLabel={heroSettings.cta_label}
      />
      {featureHighlights.length > 0 && (
        <section id="features" className="container mx-auto mt-24 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Por que líderes confiam no Celula Connect</h2>
            <p className="mt-3 text-foreground/90">
              Destaques configuráveis direto do painel para comunicar o valor da plataforma.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <div
                key={`feature-${index}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <AIStarter />
      <Pricing
        plans={plans.map((plan: PlanRecord) => {
          const billingSource =
            plan.billingSource === 'clerk' || plan.billingSource === 'manual' ? plan.billingSource : null

          return {
            id: plan.id,
            clerkId: plan.clerkId ?? null,
            name: plan.name,
            credits: plan.credits,
            currency: plan.currency ?? null,
            priceMonthlyCents: plan.priceMonthlyCents ?? null,
            priceYearlyCents: plan.priceYearlyCents ?? null,
            description: plan.description ?? null,
            features: mapPlanFeatures(plan.features),
            badge: plan.badge ?? null,
            highlight: plan.highlight ?? false,
            ctaType: plan.ctaType === 'checkout' || plan.ctaType === 'contact' ? plan.ctaType : null,
            ctaLabel: plan.ctaLabel ?? null,
            ctaUrl: plan.ctaUrl ?? null,
            billingSource,
          }
        })}
      />
      {testimonials.length > 0 && (
        <section className="container mx-auto mt-24 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Experiências de quem já está usando</h2>
            <p className="mt-3 text-foreground/90">
              Pastores e equipes compartilham como o Celula Connect fortalece suas redes de células.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <figure
                key={`testimonial-${index}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900"
              >
                <blockquote className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">"{testimonial.quote}"</blockquote>
                <figcaption className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-900 dark:text-slate-50">{testimonial.name}</span>
                  {testimonial.role ? ` · ${testimonial.role}` : ''}
                </figcaption>
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </figure>
            ))}
          </div>
        </section>
      )}
      <FAQ />
    </main>
  )
}
