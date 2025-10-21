"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/components/plans/pricing-utils'
import type { LandingPreviewPlan } from '@/lib/landing-config/types'

const HERO_HEADLINE_FALLBACK =
  'Transforme sua rede de células em uma comunidade vibrante.'
const HERO_CTA_FALLBACK = 'Solicitar demonstração'

interface PreviewFeature {
  title: string
  description: string
}

interface PreviewTestimonial {
  name: string
  role?: string
  quote: string
}

export interface LandingPreviewContent {
  heroHeadline?: string
  heroCtaLabel?: string
  features: PreviewFeature[]
  testimonials: PreviewTestimonial[]
  plans: LandingPreviewPlan[]
  generatedAtLabel?: string | null
}

interface LandingPreviewPaneProps {
  draft: LandingPreviewContent
  published?: LandingPreviewContent
  isLoading?: boolean
}

export function LandingPreviewPane({ draft, published, isLoading }: LandingPreviewPaneProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section>
        <header>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rascunho atual
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visualização baseada nos valores preenchidos nos formulários acima antes da publicação.
          </p>
        </header>
        <div className="mt-4 space-y-6">
          <PreviewHero headline={draft.heroHeadline} ctaLabel={draft.heroCtaLabel} />
          <PreviewFeatureList items={draft.features} />
          <PreviewTestimonialList items={draft.testimonials} />
        </div>
      </section>

      <section>
        <header className="flex flex-col gap-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Conteúdo publicado
          </h3>
          <p className="text-xs text-muted-foreground">
            Baseado no snapshot ativo exposto em <code className="text-[11px] font-medium">/api/public/landing-preview</code>.
          </p>
          {published?.generatedAtLabel ? (
            <span className="text-[11px] text-muted-foreground">
              Atualizado em {published.generatedAtLabel}
            </span>
          ) : null}
        </header>

        <div className="mt-4 space-y-6">
          {published ? (
            <>
              <PreviewHero headline={published.heroHeadline} ctaLabel={published.heroCtaLabel} />
              <PreviewFeatureList items={published.features} />
              <PreviewTestimonialList items={published.testimonials} />
              <PreviewPlanList plans={published.plans} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo foi publicado ainda. Salve as seções para gerar um preview público.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function PreviewHero({ headline, ctaLabel }: { headline?: string; ctaLabel?: string }) {
  const resolvedHeadline = headline && headline.trim().length > 0 ? headline.trim() : HERO_HEADLINE_FALLBACK
  const resolvedCta = ctaLabel && ctaLabel.trim().length > 0 ? ctaLabel.trim() : HERO_CTA_FALLBACK

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-5 shadow-sm">
      <GradientBackground />
      <div className="relative flex flex-col gap-6">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            Landing pastoral
          </span>
          <h4 className="text-lg font-semibold leading-tight text-foreground">{resolvedHeadline}</h4>
          <p className="text-sm text-muted-foreground">
            Este título aparece na dobra principal da landing pública e direciona o CTA configurável abaixo.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
            {resolvedCta}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">
            Botão principal posicionado ao lado de “Ver preços” para captar novos pastores.
          </p>
        </div>
        <figure className="overflow-hidden rounded-xl border bg-background shadow-inner">
          <Image
            src="/og-image.png"
            alt="Pré-visualização do painel pastoral do Célula Connect"
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  )
}

function GradientBackground() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute -left-24 top-1/3 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  )
}

function PreviewFeatureList({ items }: { items: PreviewFeature[] }) {
  return (
    <section className="rounded-2xl border bg-background/80 p-5 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Benefícios configurados</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Até três cartões destacados explicando o valor para a liderança.
          </p>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">{items.length}/3 ativos</span>
      </header>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((feature, index) => (
            <article key={`feature-preview-${index}`} className="rounded-xl border bg-muted/40 p-4">
              <h5 className="text-sm font-semibold text-foreground">{feature.title}</h5>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Publique pelo menos um benefício para destacar os diferenciais na landing.
          </p>
        )}
      </div>
    </section>
  )
}

function PreviewTestimonialList({ items }: { items: PreviewTestimonial[] }) {
  return (
    <section className="rounded-2xl border bg-background/80 p-5 shadow-sm">
      <header>
        <h4 className="text-sm font-semibold text-foreground">Depoimentos de líderes</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Construa confiança apresentando histórias reais das redes da igreja.
        </p>
      </header>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((testimonial, index) => (
            <article key={`testimonial-preview-${index}`} className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium leading-relaxed text-foreground">“{testimonial.quote}”</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {testimonial.name}
                {testimonial.role ? ` · ${testimonial.role}` : ''}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Publique pelo menos um depoimento para reforçar resultados reais com a plataforma.
          </p>
        )}
      </div>
    </section>
  )
}

function PreviewPlanList({ plans }: { plans: LandingPreviewPlan[] }) {
  return (
    <section className="rounded-2xl border bg-background/80 p-5 shadow-sm">
      <header>
        <h4 className="text-sm font-semibold text-foreground">Planos publicados</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Renderizados automaticamente com base nos planos ativos marcados para exibição.
        </p>
      </header>
      <div className="mt-4 space-y-3">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                'rounded-xl border p-4 transition-colors duration-200',
                plan.highlight ? 'border-primary/70 bg-primary/5' : 'bg-background',
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  {plan.badge ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                {plan.description ? (
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                ) : null}
                <p className="text-xs font-medium text-muted-foreground">
                  {resolvePlanPriceLabel(plan) ?? 'Preço sob consulta'}
                </p>
                <p className="text-[11px] text-muted-foreground">Créditos incluídos: {plan.credits}</p>
                {plan.features && plan.features.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {plan.features.map((feature, index) => (
                      <li key={`plan-feature-${plan.id}-${index}`}>
                        {feature.name}
                        {feature.description ? ` – ${feature.description}` : ''}
                        {!feature.included ? ' (não incluso)' : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Os planos ativos serão apresentados aqui para promover a conversão na landing.
          </p>
        )}
      </div>
    </section>
  )
}

function resolvePlanPriceLabel(plan: LandingPreviewPlan): string | null {
  if (plan.priceMonthlyCents != null) {
    return `${formatCurrency(plan.priceMonthlyCents, plan.currency)} / mês`
  }

  if (plan.priceYearlyCents != null) {
    return `${formatCurrency(plan.priceYearlyCents, plan.currency)} / ano`
  }

  return null
}
