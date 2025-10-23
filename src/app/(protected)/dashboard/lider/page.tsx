"use client";

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCelulas } from '@/hooks/use-celulas'
import type { CelulaWithRelations } from '@/hooks/use-celulas'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { useBibliaMetas, type MetaLeituraWithRelations } from '@/hooks/use-biblia'
import { useTrilhaSolicitacoes } from '@/hooks/use-trilha-solicitacoes'
import { useDomainFeatureFlags } from '@/hooks/use-domain-feature-flags'
import { useDashboardSummary } from '@/hooks/use-dashboard-summary'
import { useAvisosFeed } from '@/hooks/use-avisos'
import { useConvites } from '@/hooks/use-convites'
import { useDomainUser } from '@/hooks/use-domain-user'
import { InvitationShareDialog } from '@/components/invitations/invitation-share-dialog'

type CelulaMember = CelulaWithRelations['membros'][number]
type MetaUsuario = MetaLeituraWithRelations['usuarios'][number]

export default function DashboardLiderPage() {
  const { user } = useUser()
  const celulasQuery = useCelulas({ includeMembers: true })
  const bibliaMetasQuery = useBibliaMetas({ includeUsuarios: true, take: 12 })
  const solicitacoesQuery = useTrilhaSolicitacoes({ scope: 'lider', take: 5 })
  const featureFlags = useDomainFeatureFlags()
  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data
  const summaryQuery = useDashboardSummary('lider')

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
  const celulasLideradasIds = useMemo(() => celulasLideradas.map((celula) => celula.id), [celulasLideradas])
  const avisosFeed = useAvisosFeed(
    {
      igrejaId: domainUser?.igrejaId ?? undefined,
      celulaId: celulasLideradas.length === 1 ? celulasLideradas[0]?.id : undefined,
      usuarioId: domainUser?.id ?? undefined,
      take: 8,
      enabled: Boolean(domainUser),
    },
    {
      usuarioId: domainUser?.id ?? undefined,
      celulaIds: celulasLideradasIds,
      igrejaId: domainUser?.igrejaId ?? undefined,
    },
  )
  const convitesQuery = useConvites({
    convidadoPorId: domainUser?.id ?? undefined,
    includeCelula: true,
    includeConvidadoPor: true,
    includeUsadoPor: true,
    take: 10,
    enabled: Boolean(domainUser),
  })

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
  const avisos = avisosFeed.items
  const convites = useMemo(
    () => convitesQuery.data?.data ?? [],
    [convitesQuery.data?.data],
  )
  const convitesPendentes = useMemo(
    () => convites.filter((convite) => !convite.usado),
    [convites],
  )
  const convitesVisualizacoesTotais = convites.reduce(
    (total, convite) => total + (convite.totalVisualizacoes ?? 0),
    0,
  )
  const convitesAcessosValidos = convites.reduce(
    (total, convite) => total + (convite.totalAcessosValidos ?? 0),
    0,
  )
  const convitesConvertidos = convites.filter((convite) => convite.usado).length
  const taxaConversaoPercentual = convitesAcessosValidos > 0
    ? Math.round((convitesConvertidos / convitesAcessosValidos) * 100)
    : 0
  const solicitacoes = useMemo(
    () => solicitacoesQuery.data?.data ?? [],
    [solicitacoesQuery.data?.data],
  )
  const domainMutationsEnabled = featureFlags.data?.data?.ENABLE_DOMAIN_MUTATIONS !== false
  const summaryStats = summaryQuery.data?.data.stats ?? {}
  const totalCelulasSummary = summaryStats.totalCelulas ?? celulasParaExibir.length
  const membrosAtivosSummary =
    summaryStats.membrosAtivos ??
    celulasParaExibir.reduce(
      (acc, celula) =>
        acc + (celula.membros?.filter((membro: CelulaMember) => membro.ativo).length ?? 0),
      0,
    )
  const convitesPendentesSummary = summaryStats.convitesPendentes ?? convitesPendentes.length
  const solicitacoesPendentesSummary =
    summaryStats.solicitacoesPendentes ?? solicitacoes.filter((item) => item.status === 'PENDENTE').length

  if (celulasQuery.isLoading || summaryQuery.isLoading) {
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
      {domainMutationsEnabled ? null : (
        <Card className="border-destructive/60 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Mutação de domínio desabilitada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/80">
              Atualizações de igreja, célula e usuário estão temporariamente bloqueadas pela liderança. Conclua as revisões pendentes e aguarde a reativação da flag.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Células sob cuidado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCelulasSummary}</p>
            <p className="text-xs text-muted-foreground">
              Soma das células onde você atua como líder ou auxiliar.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{membrosAtivosSummary}</p>
            <p className="text-xs text-muted-foreground">
              Participantes marcados como ativos nas células acompanhadas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{convitesPendentesSummary}</p>
            <p className="text-xs text-muted-foreground">
              Convites enviados aguardando confirmação dos convidados.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {convitesVisualizacoesTotais} visualizações • conversão {taxaConversaoPercentual}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de trilha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{solicitacoesPendentesSummary}</p>
            <p className="text-xs text-muted-foreground">
              Avanços na trilha de crescimento aguardando validação.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avisos da liderança</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mensagens priorizadas para as suas células, equipe e comunicados gerais da igreja.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {avisosFeed.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : avisos.length ? (
              <ul className="space-y-3">
                {avisos.map((item) => (
                  <li key={item.aviso.id} className="rounded-lg border border-border/40 p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{item.aviso.titulo}</p>
                          <p className="text-xs text-muted-foreground">{item.scopeLabel}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={item.isUrgente ? 'destructive' : 'outline'}>
                            {item.aviso.prioridade.toLowerCase()}
                          </Badge>
                          <Badge variant={item.status === 'AGENDADO' ? 'secondary' : 'outline'}>
                            {item.status === 'ATIVO' ? 'ativo' : item.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vigência: {item.dataInicio.toLocaleDateString('pt-BR')}
                        {item.dataFim ? ` até ${item.dataFim.toLocaleDateString('pt-BR')}` : ''}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {item.aviso.conteudo.slice(0, 160)}
                      {item.aviso.conteudo.length > 160 ? '…' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum aviso pendente. Continue comunicando novidades pela central de avisos.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convites gerados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Acompanhe os convites enviados e quantos ainda aguardam resposta.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {convitesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : convites.length ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Total criados</p>
                    <p className="text-2xl font-semibold">{convites.length}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-semibold">{convitesPendentesSummary}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {convitesPendentes.slice(0, 4).map((convite) => (
                  <li key={convite.id} className="rounded border border-border/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{convite.nomeConvidado}</p>
                        <p className="text-xs text-muted-foreground">
                          {convite.emailConvidado} · expira em{' '}
                          {new Date(convite.dataExpiracao).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Célula: {convite.celula?.nome ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Visualizações: {convite.totalVisualizacoes ?? 0} · Acessos válidos:{' '}
                          {convite.totalAcessosValidos ?? 0}
                        </p>
                      </div>
                      {convite.tokenConvite ? (
                        <InvitationShareDialog
                          token={convite.tokenConvite}
                          convidado={convite.nomeConvidado}
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
                </ul>
                {convitesPendentes.length > 4 && (
                  <p className="text-xs text-muted-foreground">
                    +{convitesPendentes.length - 4} convites aguardando retorno.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum convite criado até o momento. Gere convites para novos visitantes a partir do painel administrativo.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas solicitações de trilha</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimas solicitações enviadas para avanço na trilha de crescimento.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {solicitacoesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : solicitacoes.length ? (
              <ul className="space-y-2">
                {solicitacoes.map((item) => (
                  <li key={item.id} className="rounded border border-border/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.trilha?.titulo ?? 'Trilha'}</p>
                        <p className="text-xs text-muted-foreground">
                          Área: {item.area?.nome ?? 'N/D'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === 'APROVADA'
                            ? 'default'
                            : item.status === 'REJEITADA'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {item.observacoesSupervisor ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Supervisor: {item.observacoesSupervisor}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação registrada recentemente. Inicie uma nova etapa no módulo de trilhas quando estiver pronto.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {celulasParaExibir.map((celula) => {
        const membrosAtivos = celula.membros?.filter((m: CelulaMember) => m.ativo) ?? []
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
                            meta.usuarios.reduce(
                              (acc: number, usuario: MetaUsuario) => acc + usuario.progressoAtual,
                              0,
                            ) / meta.usuarios.length,
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
