"use client";

import { useEffect } from 'react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminLandingConfig, useUpsertLandingConfigEntry } from '@/hooks/admin/use-admin-landing-config'
import { useAdminSystemConfig, useUpsertSystemConfigEntry } from '@/hooks/admin/use-admin-configuracoes'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

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
  const upsertLandingConfig = useUpsertLandingConfigEntry()
  const upsertSystemConfig = useUpsertSystemConfigEntry()

  const heroForm = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      headline: '',
      ctaLabel: '',
    },
  })

  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      trialDias: 30,
      suporteEmail: '',
    },
  })

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

  async function handleSubmitHero(values: HeroFormValues) {
    await Promise.all([
      upsertLandingConfig.mutateAsync({
        section: 'hero',
        key: 'headline',
        value: values.headline,
      }),
      upsertLandingConfig.mutateAsync({
        section: 'hero',
        key: 'cta_label',
        value: values.ctaLabel,
      }),
    ])

    toast({
      title: 'Landing atualizada',
      description: 'O conteúdo da seção principal foi publicado com sucesso.',
    })
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

  const isHeroLoading = heroConfigQuery.isLoading || upsertLandingConfig.isPending
  const isSystemLoading = systemConfigQuery.isLoading || upsertSystemConfig.isPending

  return (
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
  )
}
