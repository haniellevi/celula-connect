"use client";

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCelulas } from '@/hooks/use-celulas'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { useBibliaMetas, type MetaLeituraWithRelations } from '@/hooks/use-biblia'

export default function DashboardLiderPage() {
  const { user } = useUser()
  const celulasQuery = useCelulas({ includeMembers: true })
  const bibliaMetasQuery = useBibliaMetas({ includeUsuarios: true, take: 12 })

  useSetPageMetadata({
    title: "Dashboard Líder",
    description: "Planejamento das reuniões, progresso dos membros e supervisão.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Líder" },
    ],
  })

  const celulasLideradas = useMemo(() => {
    if (!user?.id) return []
    return (
      celulasQuery.data?.data.filter((celula) => celula.lider?.clerkUserId === user.id) ?? []
    )
  }, [celulasQuery.data?.data, user?.id])

  const celulasParaExibir = celulasLideradas.length ? celulasLideradas : celulasQuery.data?.data ?? []

  const metasPorCelula = useMemo(() => {
    const map = new Map<string, MetaLeituraWithRelations[]>()
    const metas = bibliaMetasQuery.data?.data ?? []
    metas.forEach((meta) => {
      if (!meta.celulaId) return
      const arr = map.get(meta.celulaId) ?? []
      arr.push(meta)
      map.set(meta.celulaId, arr)
    })
    return map
  }, [bibliaMetasQuery.data?.data])

  if (celulasQuery.isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!celulasParaExibir.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma célula liderada ainda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assim que você for configurado como líder, este painel mostrará agenda de reuniões, metas e próximos passos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {celulasParaExibir.map((celula) => {
        const membrosAtivos = celula.membros?.filter((m) => m.ativo) ?? []
        const visitantesPrevistos = celula.reunioes?.slice(-1)[0]?.visitantes ?? 0
        const metaMembros = celula.metaMembros ?? 12
        const progressoMeta = metaMembros > 0
          ? Math.round((membrosAtivos.length / metaMembros) * 100)
          : 0
        const metasDaCelula = metasPorCelula.get(celula.id) ?? []

        return (
          <Card key={celula.id}>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{celula.nome}</CardTitle>
                <Badge variant="outline">
                  Meta {celula.metaMembros ?? 12} membros
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Supervisão: {celula.supervisor?.nome ?? "Definir"} · {celula.diaSemana} às {celula.horario}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Membros ativos</p>
                <p className="text-lg font-semibold">{membrosAtivos.length}</p>
                <p className="text-xs text-muted-foreground">
                  {progressoMeta}% da meta
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Visitantes na última reunião</p>
                <p className="text-lg font-semibold">{visitantesPrevistos}</p>
                <p className="text-xs text-muted-foreground">
                  Use esta métrica para planejar follow-up personalizado.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Próxima reunião</p>
                <p className="text-sm text-muted-foreground">
                  {celula.proximaReuniao
                    ? new Date(celula.proximaReuniao).toLocaleString('pt-BR', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : "Sem reunião agendada"}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-medium mb-2">Metas de leitura da célula</p>
                {bibliaMetasQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                ) : metasDaCelula.length ? (
                  <ul className="space-y-2">
                    {metasDaCelula.map((meta) => {
                      const participantes = meta.usuarios?.length ?? 0
                      const valorMeta = meta.valorMeta ?? 0
                      const tipoMeta = meta.tipoMeta?.toLowerCase?.() ?? 'meta'
                      const progressoMedio = meta.usuarios?.length
                        ? Math.round(
                            meta.usuarios.reduce((acc, usuario) => acc + usuario.progressoAtual, 0) /
                              meta.usuarios.length,
                          )
                        : 0
                      return (
                        <li key={meta.id} className="rounded border border-border/40 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{meta.titulo}</p>
                              <p className="text-xs text-muted-foreground">
                                {participantes} participantes · Meta: {valorMeta} {tipoMeta}
                              </p>
                            </div>
                            <Badge variant="outline">{progressoMedio}/{valorMeta}</Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma meta cadastrada para esta célula ainda.
                  </p>
                )}
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button variant="outline" size="sm" disabled>
                  Gerenciar célula (em breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
