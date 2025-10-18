"use client";

import { useEffect } from 'react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useAdminLandingConfig,
  useDeleteLandingConfigEntry,
  useUpsertLandingConfigEntry,
} from '@/hooks/admin/use-admin-landing-config'
import { useAdminSystemConfig, useUpsertSystemConfigEntry } from '@/hooks/admin/use-admin-configuracoes'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useLandingPreview } from '@/hooks/use-landing-preview'
import { formatCurrency } from '@/components/plans/pricing-utils'
import type { LandingPreviewPlan } from '@/lib/landing-config/types'

const heroSchema = z.object({
  headline: z.string().min(10, 'Digite um título com pelo menos 10 caracteres.'),
  ctaLabel: z.string().min(3, 'Informe um texto curto para o botão.'),
})

type HeroFormValues = z.infer<typeof heroSchema>

const systemSchema = z.object({
  trialDias: z.coerce.number().min(1, 'Informe pelo menos 1 dia.').max(90, 'Use no máximo 90 dias.'),
  suporteEmail: z.string().email('Informe um e-mail válido.'),
})

type SystemFormValues = z.infer<typeof systemSchema>

const featureItemSchema = z
  .object({
    title: z.string().trim(),
    description: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const hasTitle = data.title.length > 0
    const hasDescription = data.description.length > 0

    if (!hasTitle && !hasDescription) return

    if (!hasTitle || data.title.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'Informe um título com pelo menos 3 caracteres.',
      })
    }

    if (!hasDescription || data.description.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'Descreva o benefício em pelo menos 10 caracteres.',
      })
    }
  })

const featuresSchema = z.object({
  features: z.array(featureItemSchema).length(3),
})

type FeaturesFormValues = z.infer<typeof featuresSchema>

const FEATURE_KEYS = [1, 2, 3] as const

function buildFeatureDefaults(): FeaturesFormValues {
  return {
    features: FEATURE_KEYS.map(() => ({ title: '', description: '' })),
  }
}

const testimonialItemSchema = z
  .object({
    name: z.string().trim(),
    role: z.string().trim(),
    quote: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const hasContent = data.name.length > 0 || data.role.length > 0 || data.quote.length > 0
    if (!hasContent) return

    if (!data.name || data.name.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Informe um nome com pelo menos 3 caracteres.',
      })
    }

    if (!data.role || data.role.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['role'],
        message: 'Informe o cargo ou igreja com pelo menos 3 caracteres.',
      })
    }

    if (!data.quote || data.quote.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quote'],
        message: 'Compartilhe um depoimento com pelo menos 20 caracteres.',
      })
    }
  })

const testimonialsSchema = z.object({
  testimonials: z.array(testimonialItemSchema).length(2),
})

type TestimonialsFormValues = z.infer<typeof testimonialsSchema>

const TESTIMONIAL_KEYS = [1, 2] as const

function buildTestimonialsDefaults(): TestimonialsFormValues {
  return {
    testimonials: TESTIMONIAL_KEYS.map(() => ({
      name: '',
      role: '',
      quote: '',
    })),
  }
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

export default function LandingConfigPage() {
  useSetPageMetadata({
    title: 'Builder da landing page',
    description: 'Edite conteúdo crítico da página pública sem necessidade de deploy.',
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pastor', href: '/dashboard/pastor' },
      { label: 'Landing configurável' },
    ],
  })

  const { toast } = useToast()
  const heroConfigQuery = useAdminLandingConfig('hero')
  const systemConfigQuery = useAdminSystemConfig()
  const featuresConfigQuery = useAdminLandingConfig('features')
  const testimonialsConfigQuery = useAdminLandingConfig('testimonials')
  const heroMutation = useUpsertLandingConfigEntry()
  const featuresMutation = useUpsertLandingConfigEntry()
  const testimonialsMutation = useUpsertLandingConfigEntry()
  const deleteFeatureEntry = useDeleteLandingConfigEntry()
  const deleteTestimonialEntry = useDeleteLandingConfigEntry()
  const upsertSystemConfig = useUpsertSystemConfigEntry()

  const heroForm = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      headline: '',
      ctaLabel: '',
    },
  })

  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemSchema) as Resolver<SystemFormValues>,
    defaultValues: {
      trialDias: 30,
      suporteEmail: '',
    },
  })

  const featuresForm = useForm<FeaturesFormValues>({
    resolver: zodResolver(featuresSchema),
    defaultValues: buildFeatureDefaults(),
  })

  const testimonialsForm = useForm<TestimonialsFormValues>({
    resolver: zodResolver(testimonialsSchema),
    defaultValues: buildTestimonialsDefaults(),
  })

  const { fields: featureFields } = useFieldArray({
    control: featuresForm.control,
    name: 'features',
  })

  const { fields: testimonialFields } = useFieldArray({
    control: testimonialsForm.control,
    name: 'testimonials',
  })

  const landingPreviewQuery = useLandingPreview()
  const publishedSnapshot = landingPreviewQuery.data?.data
  const publishedHero = publishedSnapshot?.hero ?? {}
  const publishedFeatures = publishedSnapshot?.features ?? []
  const publishedTestimonials = publishedSnapshot?.testimonials ?? []
  const publishedPlans = publishedSnapshot?.plans ?? []
  let publishedGeneratedAtLabel: string | null = null

  if (publishedSnapshot?.generatedAt) {
    const parsedTimestamp = new Date(publishedSnapshot.generatedAt)
    if (!Number.isNaN(parsedTimestamp.getTime())) {
      publishedGeneratedAtLabel = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(parsedTimestamp)
    }
  }

  useEffect(() => {
    if (!heroConfigQuery.data) return
    const entries = heroConfigQuery.data.data
    const headline = entries.find((entry) => entry.chave === 'headline')?.valor ?? ''
    const ctaLabel = entries.find((entry) => entry.chave === 'cta_label')?.valor ?? ''
    heroForm.reset({ headline, ctaLabel })
  }, [heroConfigQuery.data, heroForm])

  useEffect(() => {
    if (!systemConfigQuery.data) return
    const configs = systemConfigQuery.data.data
    const trialDias = Number(configs.find((entry) => entry.chave === 'trial_dias')?.valor ?? 30)
    const suporteEmail = configs.find((entry) => entry.chave === 'suporte_email')?.valor ?? ''
    systemForm.reset({ trialDias, suporteEmail })
  }, [systemConfigQuery.data, systemForm])

  useEffect(() => {
    if (!featuresConfigQuery.data) return
    const entries = featuresConfigQuery.data.data
    const mappedFeatures = FEATURE_KEYS.map((slot) => ({
      title: entries.find((entry) => entry.chave === `feature_${slot}_title`)?.valor ?? '',
      description: entries.find((entry) => entry.chave === `feature_${slot}_description`)?.valor ?? '',
    }))
    featuresForm.reset({ features: mappedFeatures })
  }, [featuresConfigQuery.data, featuresForm])

  useEffect(() => {
    if (!testimonialsConfigQuery.data) return
    const entries = testimonialsConfigQuery.data.data
    const mappedTestimonials = TESTIMONIAL_KEYS.map((slot) => ({
      name: entries.find((entry) => entry.chave === `testimonial_${slot}_name`)?.valor ?? '',
      role: entries.find((entry) => entry.chave === `testimonial_${slot}_role`)?.valor ?? '',
      quote: entries.find((entry) => entry.chave === `testimonial_${slot}_quote`)?.valor ?? '',
    }))
    testimonialsForm.reset({ testimonials: mappedTestimonials })
  }, [testimonialsConfigQuery.data, testimonialsForm])

  async function handleSubmitHero(values: HeroFormValues) {
    await heroMutation.mutateAsync({
      section: 'hero',
      key: 'headline',
      value: values.headline,
    })

    await heroMutation.mutateAsync({
      section: 'hero',
      key: 'cta_label',
      value: values.ctaLabel,
    })

    toast({
      title: 'Landing atualizada',
      description: 'O conteúdo da seção principal foi publicado com sucesso.',
    })

    void landingPreviewQuery.refetch()
  }

  async function handleSubmitSystem(values: SystemFormValues) {
    await Promise.all([
      upsertSystemConfig.mutateAsync({
        key: 'trial_dias',
        value: String(values.trialDias),
        categoria: 'assinaturas',
        descricao: 'Quantidade padrão de dias de avaliação após aprovação da igreja.',
      }),
      upsertSystemConfig.mutateAsync({
        key: 'suporte_email',
        value: values.suporteEmail,
        categoria: 'comunicacao',
        descricao: 'Canal oficial de suporte para pastores.',
      }),
    ])

    toast({
      title: 'Configurações salvas',
      description: 'Parâmetros gerais atualizados e sincronizados com a aplicação.',
    })
  }

  async function handleSubmitFeatures(values: FeaturesFormValues) {
    const existingKeys = new Set((featuresConfigQuery.data?.data ?? []).map((entry) => entry.chave))

    for (const [index, slot] of FEATURE_KEYS.entries()) {
      const feature = values.features[index]
      const titleKey = `feature_${slot}_title`
      const descriptionKey = `feature_${slot}_description`
      const hasContent = feature.title.length > 0 || feature.description.length > 0

      if (hasContent) {
        await featuresMutation.mutateAsync({
          section: 'features',
          key: titleKey,
          value: feature.title,
        })
        await featuresMutation.mutateAsync({
          section: 'features',
          key: descriptionKey,
          value: feature.description,
        })
      } else {
        if (existingKeys.has(titleKey)) {
          await deleteFeatureEntry.mutateAsync({
            section: 'features',
            key: titleKey,
          })
        }

        if (existingKeys.has(descriptionKey)) {
          await deleteFeatureEntry.mutateAsync({
            section: 'features',
            key: descriptionKey,
          })
        }
      }
    }

    toast({
      title: 'Seção de benefícios atualizada',
      description: 'Conteúdo publicado com sucesso na landing page.',
    })

    void landingPreviewQuery.refetch()
  }

  async function handleSubmitTestimonials(values: TestimonialsFormValues) {
    const existingKeys = new Set((testimonialsConfigQuery.data?.data ?? []).map((entry) => entry.chave))

    for (const [index, slot] of TESTIMONIAL_KEYS.entries()) {
      const testimonial = values.testimonials[index]
      const baseKey = `testimonial_${slot}`
      const nameKey = `${baseKey}_name`
      const roleKey = `${baseKey}_role`
      const quoteKey = `${baseKey}_quote`
      const hasContent = testimonial.name.length > 0 || testimonial.role.length > 0 || testimonial.quote.length > 0

      if (hasContent) {
        await testimonialsMutation.mutateAsync({
          section: 'testimonials',
          key: nameKey,
          value: testimonial.name,
        })
        await testimonialsMutation.mutateAsync({
          section: 'testimonials',
          key: roleKey,
          value: testimonial.role,
        })
        await testimonialsMutation.mutateAsync({
          section: 'testimonials',
          key: quoteKey,
          value: testimonial.quote,
        })
      } else {
        if (existingKeys.has(nameKey)) {
          await deleteTestimonialEntry.mutateAsync({
            section: 'testimonials',
            key: nameKey,
          })
        }

        if (existingKeys.has(roleKey)) {
          await deleteTestimonialEntry.mutateAsync({
            section: 'testimonials',
            key: roleKey,
          })
        }

        if (existingKeys.has(quoteKey)) {
          await deleteTestimonialEntry.mutateAsync({
            section: 'testimonials',
            key: quoteKey,
          })
        }
      }
    }

    toast({
      title: 'Depoimentos atualizados',
      description: 'As histórias compartilhadas foram publicadas com sucesso.',
    })

    void landingPreviewQuery.refetch()
  }

  const isHeroLoading = heroConfigQuery.isLoading || heroMutation.isPending
  const isSystemLoading = systemConfigQuery.isLoading || upsertSystemConfig.isPending
  const isFeaturesLoading =
    featuresConfigQuery.isLoading || featuresMutation.isPending || deleteFeatureEntry.isPending
  const isTestimonialsLoading =
    testimonialsConfigQuery.isLoading || testimonialsMutation.isPending || deleteTestimonialEntry.isPending

  const heroPreview = heroForm.watch()
  const featuresPreview = (featuresForm.watch('features') ?? []) as FeaturesFormValues['features']
  const testimonialsPreview = (testimonialsForm.watch('testimonials') ?? []) as TestimonialsFormValues['testimonials']

  const visibleFeatures = featuresPreview.filter(
    (item) => item.title.length > 0 || item.description.length > 0,
  )
  const visibleTestimonials = testimonialsPreview.filter(
    (item) => item.name.length > 0 || item.role.length > 0 || item.quote.length > 0,
  )

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start lg:gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seção principal (hero)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajuste o título e o call-to-action exibidos na landing page pública. As mudanças são refletidas imediatamente para novos visitantes.
            </p>
          </CardHeader>
          <CardContent>
            {heroConfigQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <Form {...heroForm}>
                <form onSubmit={heroForm.handleSubmit(handleSubmitHero)} className="space-y-4">
                  <FormField
                    control={heroForm.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline principal</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Ex.: Transforme sua rede de células em uma comunidade vibrante."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={heroForm.control}
                    name="ctaLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do botão CTA</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comece agora o período de avaliação" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isHeroLoading}>
                      {isHeroLoading ? 'Salvando…' : 'Publicar alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefícios em destaque</CardTitle>
            <p className="text-sm text-muted-foreground">
              Liste até três benefícios para reforçar o valor da plataforma na landing page. Deixe um slot vazio para ocultá-lo.
            </p>
          </CardHeader>
          <CardContent>
            {featuresConfigQuery.isLoading ? (
              <div className="space-y-4">
                {FEATURE_KEYS.map((key) => (
                  <div key={key} className="space-y-3 rounded-lg border p-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-20" />
                  </div>
                ))}
                <Skeleton className="h-10 w-40" />
              </div>
            ) : (
              <Form {...featuresForm}>
                <form onSubmit={featuresForm.handleSubmit(handleSubmitFeatures)} className="space-y-6">
                  <div className="space-y-4">
                    {featureFields.map((field, index) => (
                      <div key={field.id} className="space-y-3 rounded-lg border p-4">
                        <FormField
                          control={featuresForm.control}
                          name={`features.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do benefício {index + 1}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex.: Gestão centralizada das células" />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Preencha título e descrição ou deixe ambos em branco para ocultar o item.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={featuresForm.control}
                          name={`features.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} placeholder="Descreva rapidamente o benefício." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isFeaturesLoading}>
                      {isFeaturesLoading ? 'Salvando…' : 'Publicar benefícios'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depoimentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compartilhe histórias de igrejas que já utilizam o Celula Connect. Slots vazios não serão exibidos.
            </p>
          </CardHeader>
          <CardContent>
            {testimonialsConfigQuery.isLoading ? (
              <div className="space-y-4">
                {TESTIMONIAL_KEYS.map((key) => (
                  <div key={key} className="space-y-3 rounded-lg border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24" />
                  </div>
                ))}
                <Skeleton className="h-10 w-48" />
              </div>
            ) : (
              <Form {...testimonialsForm}>
                <form onSubmit={testimonialsForm.handleSubmit(handleSubmitTestimonials)} className="space-y-6">
                  <div className="space-y-4">
                    {testimonialFields.map((field, index) => (
                      <div key={field.id} className="space-y-3 rounded-lg border p-4">
                        <FormField
                          control={testimonialsForm.control}
                          name={`testimonials.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome {index + 1}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex.: Pr. Ricardo Souza" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testimonialsForm.control}
                          name={`testimonials.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo ou igreja</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex.: Pastor principal, Igreja Vida Plena" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testimonialsForm.control}
                          name={`testimonials.${index}.quote`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Depoimento</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={4}
                                  placeholder="Compartilhe o impacto em até algumas frases."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isTestimonialsLoading}>
                      {isTestimonialsLoading ? 'Salvando…' : 'Publicar depoimentos'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parâmetros gerais</CardTitle>
            <p className="text-sm text-muted-foreground">
              Controle configurações globais utilizadas em cadastros, onboarding e canais de suporte.
            </p>
          </CardHeader>
          <CardContent>
            {systemConfigQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(handleSubmitSystem)} className="space-y-4">
                  <FormField
                    control={systemForm.control}
                    name="trialDias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de avaliação padrão</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={90} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={systemForm.control}
                    name="suporteEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail de suporte</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="suporte@celulaconnect.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSystemLoading}>
                      {isSystemLoading ? 'Salvando…' : 'Atualizar parâmetros'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-6 lg:mt-0">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <p className="text-sm text-muted-foreground">
              Campos preenchidos acima aparecem aqui para uma revisão rápida antes da publicação.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rascunho atual</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Conteúdo baseado nos formulários acima antes da publicação.
                </p>
              </div>
              <div className="mt-4 space-y-6">
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hero</h4>
                  <div className="mt-2 space-y-2 rounded-lg border bg-muted/40 p-4">
                    <p className="text-lg font-semibold leading-snug">
                      {heroPreview.headline || 'Headline em destaque'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {heroPreview.ctaLabel ? `CTA: ${heroPreview.ctaLabel}` : 'Defina o texto do botão principal.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Benefícios</h4>
                  <div className="mt-2 space-y-3">
                    {visibleFeatures.length > 0 ? (
                      visibleFeatures.map((feature, index) => (
                        <div key={index} className="rounded-lg border p-3">
                          <p className="font-medium leading-tight">{feature.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Adicione pelo menos um benefício para aparecer na landing.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Depoimentos</h4>
                  <div className="mt-2 space-y-3">
                    {visibleTestimonials.length > 0 ? (
                      visibleTestimonials.map((testimonial, index) => (
                        <div key={index} className="rounded-lg border p-3">
                          <p className="font-semibold leading-tight">“{testimonial.quote}”</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {testimonial.name}
                            {testimonial.role ? ` · ${testimonial.role}` : ''}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Os depoimentos aparecerão aqui quando você preencher nome, cargo e mensagem.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </section>

            <section>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publicação vigente</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Snapshot publicado para visitantes após a última atualização.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {publishedGeneratedAtLabel ? (
                    <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                      Atualizado em {publishedGeneratedAtLabel}
                    </span>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => landingPreviewQuery.refetch()}
                    disabled={landingPreviewQuery.isFetching}
                  >
                    {landingPreviewQuery.isFetching ? 'Atualizando…' : 'Atualizar preview'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-5">
                {landingPreviewQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                ) : landingPreviewQuery.isError ? (
                  <p className="text-sm text-destructive">
                    Não foi possível carregar o preview publicado. Tente novamente mais tarde.
                  </p>
                ) : publishedSnapshot ? (
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Hero publicado
                      </h4>
                      <div className="mt-2 space-y-2 rounded-lg border bg-muted/40 p-4">
                        <p className="text-lg font-semibold leading-snug">
                          {publishedHero.headline || 'Headline em destaque'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {publishedHero.cta_label
                            ? `CTA: ${publishedHero.cta_label}`
                            : 'Defina o texto do botão principal para a landing.'}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Benefícios publicados
                      </h4>
                      <div className="mt-2 space-y-3">
                        {publishedFeatures.length > 0 ? (
                          publishedFeatures.map((feature, index) => (
                            <div key={`published-feature-${index}`} className="rounded-lg border bg-background p-3">
                              <p className="font-medium leading-tight">{feature.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Publique pelo menos um benefício para destacar os diferenciais na landing.
                          </p>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Depoimentos publicados
                      </h4>
                      <div className="mt-2 space-y-3">
                        {publishedTestimonials.length > 0 ? (
                          publishedTestimonials.map((testimonial, index) => (
                            <div key={`published-testimonial-${index}`} className="rounded-lg border bg-background p-3">
                              <p className="font-semibold leading-tight">“{testimonial.quote}”</p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {testimonial.name}
                                {testimonial.role ? ` · ${testimonial.role}` : ''}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Publique depoimentos para reforçar resultados reais com a plataforma.
                          </p>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Planos publicados
                      </h4>
                      <div className="mt-2 space-y-3">
                        {publishedPlans.length > 0 ? (
                          publishedPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`rounded-lg border p-4 ${
                                plan.highlight ? 'border-primary/60 bg-primary/5 shadow-sm' : 'bg-background'
                              }`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold leading-tight">{plan.name}</p>
                                  {plan.description ? (
                                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                  ) : null}
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {resolvePlanPriceLabel(plan) ?? 'Preço sob consulta'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Créditos: {plan.credits}</p>
                                </div>
                                {plan.badge ? (
                                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                    {plan.badge}
                                  </span>
                                ) : null}
                              </div>
                              {plan.features && plan.features.length > 0 ? (
                                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                                  {plan.features.map((feature, featureIndex) => (
                                    <li key={`plan-${plan.id}-feature-${featureIndex}`} className="leading-snug">
                                      {feature.name}
                                      {feature.description ? ` - ${feature.description}` : ''}
                                      {!feature.included ? ' (não incluso)' : ''}
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Os planos ativos serão apresentados aqui para promover a conversão na landing.
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum conteúdo foi publicado ainda. Salve as seções para gerar um preview.
                  </p>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
