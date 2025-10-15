"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { useDomainFeatureFlags } from '@/hooks/use-domain-feature-flags'

export default function AdminSettingsPage() {
  const { data } = useDomainFeatureFlags()
  const flags = data?.data ?? {}
  const domainMutationsDisabled = flags.ENABLE_DOMAIN_MUTATIONS === false
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações do Administrador</h1>
        <p className="text-muted-foreground mt-2">Configure os custos de funcionalidades e os créditos dos planos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domainMutationsDisabled ? (
          <Card className="md:col-span-3 border-destructive/60 bg-destructive/10 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold text-destructive">Mutação de domínio desabilitada</h2>
                <p className="text-sm text-destructive/80">
                  As rotas de atualização de igreja, célula e usuário estão bloqueadas até que a feature flag seja reativada.
                  Use a seção "Feature Flags" abaixo para habilitar novamente quando o QA autorizar.
                </p>
              </div>
            </div>
          </Card>
        ) : null}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Custos por Funcionalidade</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Configure os custos de crédito para cada funcionalidade do sistema
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/settings/features" className="flex items-center justify-center gap-2">
              Configurar Custos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Planos de Assinatura</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Gerencie os planos do Clerk e seus créditos mensais
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/settings/plans" className="flex items-center justify-center gap-2">
              Gerenciar Planos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Feature Flags</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Ative ou desative funcionalidades críticas durante a migração ou em fases de rollout controlado.
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/settings/feature-flags" className="flex items-center justify-center gap-2">
              Gerenciar Feature Flags
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
