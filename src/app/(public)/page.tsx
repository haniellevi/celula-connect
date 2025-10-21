export const revalidate = 300

import { Hero } from '@/components/marketing/hero'
import { Pricing } from '@/components/marketing/pricing'
import { getActivePlansSorted } from '@/lib/queries/plans'
import { FAQ } from '@/components/marketing/faq'
import { AIStarter } from '@/components/marketing/ai-starter'
import { listLandingPageConfig } from '@/lib/queries/settings'
import { extractFeatures, extractHeroContent, extractTestimonials } from '@/lib/landing-config/parsers'

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
        plans={plans.map((p) => ({
          id: p.id,
          clerkId: p.clerkId ?? null,
          name: p.name,
          credits: p.credits,
          currency: p.currency ?? null,
          priceMonthlyCents: p.priceMonthlyCents ?? null,
          priceYearlyCents: p.priceYearlyCents ?? null,
          description: p.description ?? null,
          features: Array.isArray(p.features) ? p.features.map((f: unknown) => ({
            name: (f as { name?: string }).name || '',
            description: (f as { description?: string }).description || null,
            included: (f as { included?: boolean }).included ?? true
          })) : null,
          badge: p.badge ?? null,
          highlight: p.highlight ?? false,
          ctaType: (p.ctaType === 'checkout' || p.ctaType === 'contact') ? p.ctaType : null,
          ctaLabel: p.ctaLabel ?? null,
          ctaUrl: p.ctaUrl ?? null,
          billingSource: p.billingSource as 'clerk' | 'manual' | null,
        }))}
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
