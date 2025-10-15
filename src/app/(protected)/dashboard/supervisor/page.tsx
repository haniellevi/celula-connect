"use client";

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCelulas } from '@/hooks/use-celulas'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAvisos } from '@/hooks/use-avisos'
import { useConvites } from '@/hooks/use-convites'
import { useDomainUser } from '@/hooks/use-domain-user'
import { useDomainFeatureFlags } from '@/hooks/use-domain-feature-flags'
import { useTrilhaSolicitacoes } from '@/hooks/use-trilha-solicitacoes'

function formatDate(date?: string | Date | null) {
  if (!date) return "Sem data definida"
  return new Date(date).toLocaleDateString('pt-BR', {
    dateStyle: 'medium',
  })
}

export default function DashboardSupervisorPage() {
  const { user } = useUser()
  const { data, isLoading } = useCelulas({ includeMembers: true })
  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data
  const solicitacoesPendentesQuery = useTrilhaSolicitacoes({ scope: 'pendentes', take: 5 })

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
  const avisosQuery = useAvisos({
    igrejaId: domainUser?.igrejaId ?? undefined,
    includeCelula: true,
    includeUsuario: true,
    take: 5,
    enabled: Boolean(domainUser),
  })
  const convitesQuery = useConvites({
    includeCelula: true,
    includeConvidadoPor: true,
    includeUsadoPor: true,
    take: 25,
    enabled: Boolean(domainUser),
  })

  const totalCelulas = celulasSupervisionadas.length
  const totalMembros = celulasSupervisionadas.reduce((acc, celula) => acc + (celula.membros?.length ?? 0), 0)
  const mediaPresenca = (() => {
    const reunioes = celulasSupervisionadas.flatMap((celula) => celula.reunioes ?? [])
    if (!reunioes.length) return 0
    const totalPresentes = reunioes.reduce((acc, reuniao) => acc + (reuniao.presentes ?? 0), 0)
    return Math.round(totalPresentes / reunioes.length)
  })()
  const avisos = avisosQuery.data?.data ?? []
  const convitesFiltrados = useMemo(() => {
    if (!celulasSupervisionadas.length) return []
    const ids = new Set(celulasSupervisionadas.map((celula) => celula.id))
    return (convitesQuery.data?.data ?? []).filter((convite) => ids.has(convite.celulaId))
  }, [celulasSupervisionadas, convitesQuery.data?.data])
  const convitesPendentes = convitesFiltrados.filter((convite) => !convite.usado)
  const solicitacoesPendentes = solicitacoesPendentesQuery.data?.data ?? []
  const domainMutationsEnabled = featureFlags.data?.data?.ENABLE_DOMAIN_MUTATIONS !== false

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
      {domainMutationsEnabled ? null : (
        <Card className="border-destructive/60 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Mutação de domínio desabilitada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/80">
              Atualizações administrativas estão bloqueadas. Centralize validações e aguarde liberação da liderança antes de tentar editar igrejas, células ou usuários.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertas das células</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos avisos publicados para a sua rede de supervisão.
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      {aviso.conteudo.slice(0, 160)}
                      {aviso.conteudo.length > 160 ? '…' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum aviso crítico enviado recentemente para as células sob sua responsabilidade.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convites em acompanhamento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Convites emitidos pelas células supervisionadas e que ainda aguardam retorno.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {convitesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : convitesFiltrados.length ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Em aberto</p>
                    <p className="text-2xl font-semibold">{convitesPendentes.length}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Total analisado</p>
                    <p className="text-2xl font-semibold">{convitesFiltrados.length}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {convitesPendentes.slice(0, 4).map((convite) => (
                    <li key={convite.id} className="rounded border border-border/40 p-3">
                      <p className="text-sm font-medium">{convite.nomeConvidado}</p>
                      <p className="text-xs text-muted-foreground">
                        {convite.emailConvidado} · expira {new Date(convite.dataExpiracao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Líder responsável: {convite.convidadoPor?.nome ?? '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem convites pendentes no momento. Incentive os líderes a registrar novos interessados.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de trilha pendentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Aprovações aguardando análise nas áreas que você supervisiona.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {solicitacoesPendentesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : solicitacoesPendentes.length ? (
              <ul className="space-y-2">
                {solicitacoesPendentes.map((item) => (
                  <li key={item.id} className="rounded border border-border/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {item.usuario?.nome ?? 'Discípulo'} → {item.trilha?.titulo ?? 'Trilha'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Área: {item.area?.nome ?? 'N/D'} · {new Date(item.dataSolicitacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Motivo: {item.motivo ?? '—'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação pendente para aprovação. Ao receber novas requisições, elas aparecerão aqui.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
