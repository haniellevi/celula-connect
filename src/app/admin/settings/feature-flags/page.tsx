"use client";

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminFeatureFlags, useUpdateFeatureFlag } from '@/hooks/admin/use-admin-feature-flags'
import { useToast } from '@/hooks/use-toast'

const FLAG_METADATA: Record<
  string,
  {
    label: string
    description: string
  }
> = {
  ENABLE_DOMAIN_MUTATIONS: {
    label: 'Habilitar mutações de domínio',
    description: 'Controla endpoints de atualização para igrejas, células e usuários enquanto o QA final não ocorre.',
  },
}

export default function FeatureFlagsSettingsPage() {
  const flagsQuery = useAdminFeatureFlags()
  const updateFlag = useUpdateFeatureFlag()
  const { toast } = useToast()

  const flags = useMemo(
    () => flagsQuery.data?.data ?? {},
    [flagsQuery.data?.data],
  )
  const isLoading = flagsQuery.isLoading

  const items = useMemo(() => {
    const keys = Object.keys({ ...FLAG_METADATA, ...flags })
    return keys.sort()
  }, [flags])

  const handleToggle = (key: string, value: boolean) => {
    updateFlag.mutate(
      {
        key,
        enabled: value,
        descricao: FLAG_METADATA[key]?.description,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Feature flag atualizada',
            description: `${FLAG_METADATA[key]?.label ?? key} está ${value ? 'ativada' : 'desativada'}.`,
          })
        },
        onError: () => {
          toast({
            title: 'Erro ao atualizar feature flag',
            description: 'Tente novamente ou verifique os logs.',
            variant: 'destructive',
          })
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Feature Flags</h1>
        <p className="text-muted-foreground mt-2">
          Controle a disponibilidade de funcionalidades sensíveis durante a migração.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : items.length ? (
          <div className="space-y-4">
            {items.map((key) => {
              const meta = FLAG_METADATA[key]
              const enabled = flags[key] ?? false
              return (
                <div key={key} className="flex items-start justify-between gap-4 rounded-lg border border-border/40 p-4">
                  <div>
                    <Label htmlFor={`flag-${key}`} className="text-base font-semibold">
                      {meta?.label ?? key}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {meta?.description ?? 'Flag não documentada.'}
                    </p>
                  </div>
                  <Switch
                    id={`flag-${key}`}
                    checked={enabled}
                    disabled={updateFlag.isPending}
                    onCheckedChange={(value) => handleToggle(key, value)}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma feature flag disponível.</p>
        )}
      </Card>
    </div>
  )
}
