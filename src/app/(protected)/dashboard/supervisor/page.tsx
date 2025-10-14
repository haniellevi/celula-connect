"use client";

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCelulas } from '@/hooks/use-celulas'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Button } from '@/components/ui/button'

function formatDate(date?: string | Date | null) {
  if (!date) return "Sem data definida"
  return new Date(date).toLocaleDateString('pt-BR', {
    dateStyle: 'medium',
  })
}

export default function DashboardSupervisorPage() {
  const { user } = useUser()
  const { data, isLoading } = useCelulas({ includeMembers: true })

  useSetPageMetadata({
    title: "Dashboard Supervisor",
    description: "Acompanhe as células sob sua supervisão e identifique prioridades.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Supervisor" },
    ],
  })

  const celulasSupervisionadas = useMemo(() => {
    if (!user?.id) return []
    return (
      data?.data.filter((celula) => celula.supervisor?.clerkUserId === user.id) ?? []
    )
  }, [data?.data, user?.id])

  const totalCelulas = celulasSupervisionadas.length
  const totalMembros = celulasSupervisionadas.reduce((acc, celula) => acc + (celula.membros?.length ?? 0), 0)
  const mediaPresenca = (() => {
    const reunioes = celulasSupervisionadas.flatMap((celula) => celula.reunioes ?? [])
    if (!reunioes.length) return 0
    const totalPresentes = reunioes.reduce((acc, reuniao) => acc + (reuniao.presentes ?? 0), 0)
    return Math.round(totalPresentes / reunioes.length)
  })()

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    )
  }

  if (!celulasSupervisionadas.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma célula supervisionada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Utilize o módulo administrativo para atribuir células a sua supervisão. Assim que houver células vinculadas, você verá métricas consolidadas neste painel.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de células</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCelulas}</p>
            <p className="text-xs text-muted-foreground">
              Células sob sua supervisão direta.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros acompanhados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalMembros}</p>
            <p className="text-xs text-muted-foreground">
              Inclui líderes, auxiliares e discípulos ativos.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Média de presença</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{mediaPresenca}</p>
            <p className="text-xs text-muted-foreground">
              Participantes por reunião (últimos registros).
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {celulasSupervisionadas.map((celula) => (
          <Card key={celula.id}>
            <CardHeader>
              <CardTitle>{celula.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Líder: {celula.lider?.nome ?? "Definir"} · {celula.diaSemana} às {celula.horario}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Membros cadastrados</p>
                <p className="text-lg font-semibold">{celula.membros?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Última reunião</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(celula.reunioes?.slice(-1)[0]?.data)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Próximo passo</p>
                <p className="text-sm text-muted-foreground">
                  Coordene feedback com o líder e acompanhe novos visitantes.
                </p>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" size="sm" disabled>
                  Abrir relatório (em breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
