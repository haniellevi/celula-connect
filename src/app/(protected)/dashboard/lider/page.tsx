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
import { useTrilhaSolicitacoes } from '@/hooks/use-trilha-solicitacoes'
import { useAvisos } from '@/hooks/use-avisos'
import { useConvites } from '@/hooks/use-convites'
import { useDomainUser } from '@/hooks/use-domain-user'

export default function DashboardLiderPage() {
  const { user } = useUser()
  const celulasQuery = useCelulas({ includeMembers: true })
  const bibliaMetasQuery = useBibliaMetas({ includeUsuarios: true, take: 12 })
  const solicitacoesQuery = useTrilhaSolicitacoes({ scope: 'lider', take: 5 })
  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data

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
  const avisosQuery = useAvisos({
    igrejaId: domainUser?.igrejaId ?? undefined,
    celulaId: celulasLideradas.length === 1 ? celulasLideradas[0]?.id : undefined,
    includeCelula: true,
    includeUsuario: true,
    take: 5,
    enabled: Boolean(domainUser),
  })
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
  const avisos = avisosQuery.data?.data ?? []
  const convites = convitesQuery.data?.data ?? []
  const convitesPendentes = useMemo(
    () => convites.filter((convite) => !convite.usado),
    [convites],
  )
  const solicitacoes = solicitacoesQuery.data?.data ?? []

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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avisos da liderança</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mensagens direcionadas para as suas células e equipe imediata.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {avisosQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : avisos.length ? (
              <ul className="space-y-3">
                {avisos.map((aviso) => (
                  <li key={aviso.id} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{aviso.titulo}</p>
                      <Badge variant={aviso.prioridade === 'URGENTE' ? 'destructive' : 'outline'}>
                        {aviso.prioridade}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {aviso.celula?.nome ?? aviso.igreja?.nome ?? 'Comunicação geral'} ·{' '}
                      {new Date(aviso.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {aviso.conteudo.slice(0, 160)}
                      {aviso.conteudo.length > 160 ? '…' : ''}
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
                    <p className="text-2xl font-semibold">{convitesPendentes.length}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {convitesPendentes.slice(0, 4).map((convite) => (
                    <li key={convite.id} className="rounded border border-border/40 p-3">
                      <p className="text-sm font-medium">{convite.nomeConvidado}</p>
                      <p className="text-xs text-muted-foreground">
                        {convite.emailConvidado} · expira em{' '}
                        {new Date(convite.dataExpiracao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Célula: {convite.celula?.nome ?? '—'}
                      </p>
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
