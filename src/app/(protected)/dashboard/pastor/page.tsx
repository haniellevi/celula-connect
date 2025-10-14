"use client";

import { useMemo } from 'react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { useIgrejas } from '@/hooks/use-igrejas'
import { useCelulas } from '@/hooks/use-celulas'
import { useUsuarios } from '@/hooks/use-usuarios'
import { useBibliaMetas } from '@/hooks/use-biblia'
import { PerfilUsuario } from '../../../../../prisma/generated/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DashboardPastorPage() {
  const igrejasQuery = useIgrejas({ includeCelulas: true, includePlano: true })
  const celulasQuery = useCelulas({ includeMembers: true })
  const usuariosQuery = useUsuarios({ includeIgreja: true, take: 200 })
  const bibliaMetasQuery = useBibliaMetas({ includeUsuarios: true, includeLeituras: true, take: 50 })

  useSetPageMetadata({
    title: "Dashboard Pastor",
    description: "Visão executiva das igrejas, células e equipes de liderança.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Pastor" },
    ],
  })

  const isLoading = igrejasQuery.isLoading || celulasQuery.isLoading || usuariosQuery.isLoading || bibliaMetasQuery.isLoading

  const totalIgrejas = igrejasQuery.data?.data.length ?? 0
  const totalCelulas = celulasQuery.data?.data.length ?? 0
  const totalMembros = (celulasQuery.data?.data ?? []).reduce((acc, celula) => acc + (celula.membros?.length ?? 0), 0)

  const contagemPorPerfil = useMemo(() => {
    const usuarios = usuariosQuery.data?.data ?? []
    return {
      discipulos: usuarios.filter((u) => u.perfil === PerfilUsuario.DISCIPULO).length,
      lideres: usuarios.filter((u) => u.perfil === PerfilUsuario.LIDER_CELULA).length,
      supervisores: usuarios.filter((u) => u.perfil === PerfilUsuario.SUPERVISOR).length,
      pastores: usuarios.filter((u) => u.perfil === PerfilUsuario.PASTOR).length,
    }
  }, [usuariosQuery.data?.data])

  const resumoBiblico = useMemo(() => {
    const metas = bibliaMetasQuery.data?.data ?? []
    const metasAtivas = metas.filter((meta) => meta.ativa)
    const totalParticipantes = metas.reduce((acc, meta) => acc + (meta.usuarios?.length ?? 0), 0)
    const leiturasRegistradas = metas.reduce((acc, meta) => acc + (meta.leituras?.length ?? 0), 0)
    return {
      totalMetas: metas.length,
      metasAtivas: metasAtivas.length,
      participantes: totalParticipantes,
      leituras: leiturasRegistradas,
    }
  }, [bibliaMetasQuery.data?.data])

  const principaisCelulas = useMemo(() => {
    return (celulasQuery.data?.data ?? [])
      .slice()
      .sort((a, b) => (b.membros?.length ?? 0) - (a.membros?.length ?? 0))
      .slice(0, 3)
  }, [celulasQuery.data?.data])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    )
  }

  if (!totalIgrejas) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma igreja cadastrada ainda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Utilize o módulo administrativo para criar a primeira igreja e atribuir seus líderes. Com pelo menos uma igreja ativa, este painel exibirá visão consolidada de células, membros e equipes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Igrejas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalIgrejas}</p>
            <p className="text-xs text-muted-foreground">incluindo trials e planos pagos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Células</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCelulas}</p>
            <p className="text-xs text-muted-foreground">visão consolidada entre todas as igrejas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalMembros}</p>
            <p className="text-xs text-muted-foreground">participantes ativos nas células.</p>
          </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liderança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.pastores}</span> pastores</p>
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.supervisores}</span> supervisores</p>
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.lideres}</span> líderes de célula</p>
        </CardContent>
      </Card>
    </div>

      <Card>
        <CardHeader>
          <CardTitle>Engajamento bíblico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Metas cadastradas</p>
            <p className="text-2xl font-semibold">{resumoBiblico.totalMetas}</p>
            <p className="text-xs text-muted-foreground">
              {resumoBiblico.metasAtivas} ativas no momento.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Participantes envolvidos</p>
            <p className="text-2xl font-semibold">{resumoBiblico.participantes}</p>
            <p className="text-xs text-muted-foreground">
              Discipuladores e discípulos acompanhando metas.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Leituras registradas</p>
            <p className="text-2xl font-semibold">{resumoBiblico.leituras}</p>
            <p className="text-xs text-muted-foreground">
              Entradas sincronizadas com progresso automático.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Igrejas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {igrejasQuery.data?.data.map((igreja) => (
            <div key={igreja.id} className="rounded-lg border border-border/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{igreja.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {igreja.cidade}, {igreja.estado}
                  </p>
                </div>
                <Badge variant="outline">{igreja.statusAssinatura}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Plano: {igreja.plano?.nome ?? "Não configurado"}
              </p>
              <p className="text-xs text-muted-foreground">
                Células vinculadas: {igreja.celulas?.length ?? 0}
              </p>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" disabled>
                  Configurar plano (em breve)
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Células em destaque</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {principaisCelulas.map((celula) => (
            <div key={celula.id} className="rounded-lg border border-border/40 p-4">
              <h3 className="font-semibold">{celula.nome}</h3>
              <p className="text-xs text-muted-foreground">
                Líder: {celula.lider?.nome ?? "Definir"}
              </p>
              <p className="text-xs text-muted-foreground">
                Membros: {celula.membros?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Última reunião: {celula.reunioes?.length ? new Date(celula.reunioes.slice(-1)[0].data).toLocaleDateString('pt-BR') : "Sem registro"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
