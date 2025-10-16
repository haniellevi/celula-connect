"use client";

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSetPageMetadata } from '@/contexts/page-metadata'

export default function TrilhaOverviewPage() {
  useSetPageMetadata({
    title: "Trilha de Crescimento",
    description: "Acompanhe o progresso dos discípulos, configure etapas e acesse o fluxo de aprovação.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Trilha" },
    ],
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/50 bg-card/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Sistema de aprovação
            <Badge variant="secondary">Prioridade</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Supervisores e pastores podem analisar solicitações de avanço, registrar pareceres e aprovar novos
            níveis da trilha de crescimento de forma centralizada.
          </p>
          <Button asChild>
            <Link href="/trilha/aprovacao" className="flex items-center gap-2">
              Abrir fluxo de aprovação
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Este módulo receberá painéis com indicadores de progresso, gestão das trilhas disponíveis e um histórico de atividades.</p>
          <p>Enquanto isso, utilize o fluxo de aprovação para manter o acompanhamento das solicitações de avanço ativo.</p>
        </CardContent>
      </Card>
    </div>
  )
}
