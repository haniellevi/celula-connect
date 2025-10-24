"use client";

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCelulas } from '@/hooks/use-celulas'
import type { CelulaWithRelations } from '@/hooks/use-celulas'
import { useBibliaLeiturasUsuario, useBibliaMetasUsuario } from '@/hooks/use-biblia'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { useAvisosFeed } from '@/hooks/use-avisos'
import { useDevocionais } from '@/hooks/use-devocionais'
import { useDomainUser } from '@/hooks/use-domain-user'

type CelulaMember = CelulaWithRelations['membros'][number]

export default function DashboardDiscipuloPage() {
  const { user } = useUser()
  const celulasQuery = useCelulas({ includeMembers: true })
  const metasQuery = useBibliaMetasUsuario('me', {
    includeMeta: true,
    includeProgresso: true,
    take: 3,
  })
  const leiturasQuery = useBibliaLeiturasUsuario('me', {
    take: 3,
    order: 'desc',
  })
  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data
  const hoje = useMemo(() => new Date(), [])
  const fimJanelaDevocional = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  }, [])
  const devocionaisQuery = useDevocionais({
    dataInicial: hoje,
    dataFinal: fimJanelaDevocional,
    take: 5,
  })

  useSetPageMetadata({
    title: "Dashboard Discípulo",
    description: "Resumo da sua célula, metas de leitura e últimos registros.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Discípulo" },
    ],
  })

  const minhasCelulas = useMemo(() => {
    if (!user?.id) return []
    return (
      celulasQuery.data?.data.filter((celula) =>
        celula.membros?.some((membro: CelulaMember) => membro.usuario?.clerkUserId === user.id),
      ) ?? []
    )
  }, [celulasQuery.data?.data, user?.id])
  const primaryCelulaId = useMemo(() => {
    if (minhasCelulas.length) {
      return minhasCelulas[0]?.id ?? null
    }
    const membership = domainUser?.membrosCelula?.[0]
    return membership?.celulaId ?? null
  }, [domainUser?.membrosCelula, minhasCelulas])
  const minhasCelulasIds = useMemo(() => minhasCelulas.map((celula) => celula.id), [minhasCelulas])
  const avisosFeed = useAvisosFeed(
    {
      igrejaId: domainUser?.igrejaId ?? undefined,
      celulaId: primaryCelulaId ?? undefined,
      usuarioId: domainUser?.id ?? undefined,
      take: 6,
      enabled: Boolean(domainUser),
    },
    {
      usuarioId: domainUser?.id ?? undefined,
      celulaIds: minhasCelulasIds,
      igrejaId: domainUser?.igrejaId ?? undefined,
    },
  )

  if (celulasQuery.isLoading && !celulasQuery.data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Metas de leitura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leituras recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!celulasQuery.data?.data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma célula disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assim que sua liderança vincular você a uma célula, este painel exibirá próximos encontros, responsáveis e participantes.
          </p>
        </CardContent>
      </Card>
    )
  }

  const celulasParaExibir = minhasCelulas.length ? minhasCelulas : celulasQuery.data.data.slice(0, 2)
  const metasDoUsuario = metasQuery.data?.data ?? []
  const leiturasRecentes = leiturasQuery.data?.data ?? []
  const devocionais = devocionaisQuery.data?.data ?? []
  const destaqueDevocional = devocionais[0]
  const avisos = avisosFeed.items

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devocional em destaque</CardTitle>
            <p className="text-sm text-muted-foreground">
              Próximo conteúdo devocional liberado para sua igreja.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {devocionaisQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-16" />
              </div>
            ) : destaqueDevocional ? (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    {new Date(String(destaqueDevocional.dataDevocional)).toLocaleDateString('pt-BR', {
                      dateStyle: 'full',
                    })}
                  </p>
                  <h3 className="text-lg font-semibold">{String(destaqueDevocional.titulo)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {String(destaqueDevocional.versiculoReferencia)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {String(destaqueDevocional.conteudo).slice(0, 220)}
                  {String(destaqueDevocional.conteudo).length > 220 ? '…' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  “{String(destaqueDevocional.versiculoTexto)}”
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum devocional programado para os próximos dias. Peça à sua liderança para registrar novos conteúdos.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avisos recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comunicados priorizados pela liderança da sua célula ou igreja.
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.aviso.conteudo.slice(0, 180)}
                      {item.aviso.conteudo.length > 180 ? '…' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum aviso direcionado para você no momento.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {celulasParaExibir.map((celula) => (
          <Card key={celula.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{celula.nome}</CardTitle>
                <Badge variant={celula.ativa ? "default" : "secondary"}>
                  {celula.ativa ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {celula.igreja?.nome ?? "Igreja sem cadastro"} · {celula.diaSemana} às {celula.horario}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Liderança</p>
                <p className="text-sm text-muted-foreground">
                  Líder: {celula.lider?.nome ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supervisor: {celula.supervisor?.nome ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Próximo encontro</p>
                <p className="text-sm text-muted-foreground">
                  {celula.proximaReuniao
                    ? new Date(celula.proximaReuniao).toLocaleString('pt-BR', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : "Aguardando agenda"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Participantes</p>
                <p className="text-sm text-muted-foreground">
                  {celula.membros?.length ?? 0} membros registrados
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" disabled>
                  Solicitar avanço (em breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas de leitura</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso nas metas atribuídas pela liderança.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {metasQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : metasDoUsuario.length ? (
            <ul className="space-y-4">
              {metasDoUsuario.map((metaUsuario) => {
                const meta = metaUsuario.meta
                const valorMeta = meta?.valorMeta ?? 0
                const progresso = metaUsuario.progressoAtual
                const percentual = valorMeta > 0 ? Math.min(100, Math.round((progresso / valorMeta) * 100)) : 0

                return (
                  <li key={metaUsuario.id} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{meta?.titulo ?? 'Meta de leitura'}</p>
                        <p className="text-xs text-muted-foreground">
                          {valorMeta} {meta?.tipoMeta?.toLowerCase?.() ?? 'itens'} · Atualizado em{' '}
                          {metaUsuario.ultimaAtualizacao
                            ? new Date(metaUsuario.ultimaAtualizacao).toLocaleDateString('pt-BR')
                            : '—'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {progresso}/{valorMeta}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {percentual}% concluído · Responsável: {meta?.celula?.nome ?? 'Liderança da igreja'}
                    </p>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma meta atribuída ainda. Quando a liderança criar um plano de leitura para você, ele aparecerá aqui.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leituras recentes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Registros sincronizados com o progresso automático das metas.
          </p>
        </CardHeader>
        <CardContent>
          {leiturasQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : leiturasRecentes.length ? (
            <ul className="space-y-3">
              {leiturasRecentes.map((leitura) => (
                <li key={leitura.id} className="rounded-lg border border-border/40 p-3">
                  <p className="text-sm font-medium">
                    {leitura.livroCodigo} • cap. {leitura.capitulo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leitura.dataLeitura
                      ? new Date(leitura.dataLeitura).toLocaleString('pt-BR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Data não registrada'}
                  </p>
                  {leitura.observacoes ? (
                    <p className="mt-2 text-xs text-muted-foreground">{leitura.observacoes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma leitura registrada ainda. Utilize a ferramenta de leitura bíblica para registrar seu progresso diário.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
