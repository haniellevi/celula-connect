"use client";

import { useMemo, useState } from 'react'
import { GraduationCap, Users, Timer, BarChart2, Search, Layers, CalendarClock } from 'lucide-react'
import { useTrilhas } from '@/hooks/use-trilhas'
import { useTrilhaSolicitacoes } from '@/hooks/use-trilha-solicitacoes'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { StatusSolicitacao } from '@/lib/prisma-client'

type StatusFilter = 'ativas' | 'inativas' | 'todas'

interface TrilhaEtapa {
  ordem?: number
  titulo?: string
  duracaoDias?: number
  descricao?: string
}

interface TrilhaConteudo {
  etapas?: TrilhaEtapa[]
  [key: string]: unknown
}

function parseConteudo(conteudo: unknown): TrilhaConteudo {
  if (!conteudo || typeof conteudo !== 'object') return {}
  const value = conteudo as Record<string, unknown>
  const etapasRaw = value.etapas
  if (!Array.isArray(etapasRaw)) return {}
  const etapas: TrilhaEtapa[] = etapasRaw.map((item) => {
    if (!item || typeof item !== 'object') return {}
    const etapa = item as Record<string, unknown>
    return {
      ordem: typeof etapa.ordem === 'number' ? etapa.ordem : undefined,
      titulo: typeof etapa.titulo === 'string' ? etapa.titulo : undefined,
      duracaoDias: typeof etapa.duracaoDias === 'number' ? etapa.duracaoDias : undefined,
      descricao: typeof etapa.descricao === 'string' ? etapa.descricao : undefined,
    }
  })
  return { etapas }
}

const STATUS_BADGE_STYLES: Record<StatusSolicitacao, string> = {
  [StatusSolicitacao.PENDENTE]: 'border-amber-200 bg-amber-100 text-amber-800',
  [StatusSolicitacao.APROVADA]: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  [StatusSolicitacao.REJEITADA]: 'border-rose-200 bg-rose-100 text-rose-700',
}

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  [StatusSolicitacao.PENDENTE]: 'Pendente',
  [StatusSolicitacao.APROVADA]: 'Aprovada',
  [StatusSolicitacao.REJEITADA]: 'Rejeitada',
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return 'Não informado'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function TrilhaPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativas')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrilhaId, setSelectedTrilhaId] = useState<string | null>(null)

  useSetPageMetadata({
    title: "Trilha de Crescimento",
    description: "Acompanhe as trilhas disponíveis, métricas de progresso e os fluxos de aprovação.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Trilha" },
    ],
  })

  const trilhasQuery = useTrilhas({
    includeUsuarios: true,
    includeAreas: true,
    take: 100,
  })

  const trilhas = useMemo(() => trilhasQuery.data?.data ?? [], [trilhasQuery.data])

  const filteredTrilhas = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    return trilhas.filter((trilha) => {
      const matchesStatus =
        statusFilter === 'todas'
          ? true
          : statusFilter === 'ativas'
            ? trilha.ativa
            : !trilha.ativa
      const matchesSearch = normalized
        ? trilha.titulo.toLowerCase().includes(normalized) ||
          (trilha.descricao ?? '').toLowerCase().includes(normalized)
        : true
      return matchesStatus && matchesSearch
    })
  }, [trilhas, statusFilter, searchTerm])

  const selectedTrilha = useMemo(
    () => filteredTrilhas.find((trilha) => trilha.id === selectedTrilhaId) ?? filteredTrilhas[0],
    [filteredTrilhas, selectedTrilhaId],
  )

  const selectedTrilhaKey = selectedTrilha?.id

  const solicitacoesHistoricoQuery = useTrilhaSolicitacoes({
    scope: 'all',
    trilhaId: selectedTrilhaKey ?? undefined,
    take: 10,
    includeArea: true,
    includeLider: true,
    includeTrilha: true,
    includeUsuario: true,
    includeSupervisor: true,
    enabled: Boolean(selectedTrilhaKey),
  })

  const solicitacoesHistorico = useMemo(
    () => solicitacoesHistoricoQuery.data?.data ?? [],
    [solicitacoesHistoricoQuery.data],
  )

  const metrics = useMemo(() => {
    if (!trilhas.length) {
      return {
        total: 0,
        ativas: 0,
        participantes: 0,
        duracaoMedia: 0,
      }
    }
    const total = trilhas.length
    const ativas = trilhas.filter((trilha) => trilha.ativa).length
    const participantes = trilhas.reduce(
      (acc, trilha) => acc + (trilha.usuariosTrilha?.length ?? 0),
      0,
    )
    const duracaoMedia =
      trilhas.reduce((acc, trilha) => acc + (trilha.duracaoDias ?? 0), 0) / total

    return {
      total,
      ativas,
      participantes,
      duracaoMedia: Math.round(duracaoMedia),
    }
  }, [trilhas])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <GraduationCap className="h-4 w-4 text-primary" />
              Trilhas cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.total}</p>
            <p className="text-sm text-muted-foreground">
              {metrics.ativas} ativas · {metrics.total - metrics.ativas} arquivadas
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.participantes}</p>
            <p className="text-sm text-muted-foreground">
              Discipuladores e discípulos em trilhas de crescimento
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Timer className="h-4 w-4 text-primary" />
              Duração média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.duracaoMedia} dias</p>
            <p className="text-sm text-muted-foreground">Tempo estimado de conclusão por trilha</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart2 className="h-4 w-4 text-primary" />
              Fluxo de aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use o fluxo dedicado para gerenciar solicitações pendentes.</p>
            <Button variant="secondary" size="sm" asChild>
              <a href="/trilha/aprovacao">Abrir solicitações</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ativas">
              Ativas
              <Badge variant="secondary" className="ml-2">
                {metrics.ativas}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inativas">
              Arquivadas
              <Badge variant="secondary" className="ml-2">
                {metrics.total - metrics.ativas}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="todas">
              Todas
              <Badge variant="secondary" className="ml-2">
                {metrics.total}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título ou descrição"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4 text-primary" />
              Trilhas
            </CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className="max-h-[480px]">
            <div className="divide-y divide-border/60">
              {trilhasQuery.isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Carregando trilhas...</div>
              ) : filteredTrilhas.length ? (
                filteredTrilhas.map((trilha) => {
                  const participantes = trilha.usuariosTrilha?.length ?? 0
                  const etapas = parseConteudo(trilha.conteudo).etapas?.length ?? 0
                  const isSelected = selectedTrilha?.id === trilha.id
                  return (
                    <button
                      key={trilha.id}
                      type="button"
                      onClick={() => setSelectedTrilhaId(trilha.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        isSelected ? 'bg-accent/40' : 'hover:bg-accent/20'
                      }`}
                    >
                      <p className="font-semibold">{trilha.titulo}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{trilha.tipo}</span>
                        <span>· {trilha.duracaoDias ?? 0} dias</span>
                        <span>· {participantes} participantes</span>
                        <span>· {etapas} etapas</span>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  Nenhuma trilha corresponde aos filtros atuais.
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur">
          {selectedTrilha ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">{selectedTrilha.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedTrilha.descricao ?? 'Trilha sem descrição cadastrada.'}
                    </p>
                  </div>
                  {selectedTrilha.ativa ? (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700">
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
                      Arquivada
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">Participantes</p>
                    <p className="mt-1 text-2xl font-semibold">{selectedTrilha.usuariosTrilha?.length ?? 0}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">Duração estimada</p>
                    <p className="mt-1 text-2xl font-semibold">{selectedTrilha.duracaoDias ?? 0} dias</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                    <p className="text-xs text-muted-foreground">Ordem</p>
                    <p className="mt-1 text-2xl font-semibold">{selectedTrilha.ordem}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Etapas da trilha
                    </h3>
                    <Badge variant="secondary">
                      {(parseConteudo(selectedTrilha.conteudo).etapas?.length ?? 0)} etapas
                    </Badge>
                  </div>
                  <Tabs defaultValue="estrutura">
                    <TabsList>
                      <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                      <TabsTrigger value="areas">Áreas de supervisão</TabsTrigger>
                    </TabsList>
                    <TabsContent value="estrutura" className="mt-4 space-y-3">
                      {parseConteudo(selectedTrilha.conteudo).etapas?.length ? (
                        parseConteudo(selectedTrilha.conteudo).etapas!.map((etapa, index) => (
                          <div
                            key={`${etapa.ordem ?? index}-${etapa.titulo ?? 'etapa'}`}
                            className="rounded-lg border border-border/50 bg-accent/5 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">
                                  {etapa.ordem ?? index + 1}. {etapa.titulo ?? 'Etapa sem título'}
                                </p>
                                {etapa.descricao && (
                                  <p className="mt-1 text-sm text-muted-foreground">{etapa.descricao}</p>
                                )}
                              </div>
                              {typeof etapa.duracaoDias === 'number' && (
                                <Badge variant="outline">{etapa.duracaoDias} dias</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma etapa cadastrada para esta trilha.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="areas" className="mt-4 space-y-3">
                      {selectedTrilha.etapasArea?.length ? (
                        selectedTrilha.etapasArea.map((etapa) => (
                          <div
                            key={`${etapa.trilhaId}-${etapa.areaId}`}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-accent/5 p-4"
                          >
                            <div>
                              <p className="text-sm font-semibold">{etapa.area?.nome ?? 'Área sem nome'}</p>
                              {etapa.area?.descricao && (
                                <p className="text-xs text-muted-foreground">{etapa.area.descricao}</p>
                              )}
                            </div>
                            <Badge variant="outline">{etapa.podeAprovar ? 'Aprova' : 'Monitoria'}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma área de supervisão vinculada a esta trilha.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Participantes e progresso
                    </h3>
                    <Badge variant="secondary">
                      {selectedTrilha.usuariosTrilha?.length ?? 0} ativos
                    </Badge>
                  </div>
                  {selectedTrilha.usuariosTrilha?.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedTrilha.usuariosTrilha.map((registro) => (
                        <div
                          key={registro.id}
                          className="rounded-lg border border-border/40 bg-background/40 p-4"
                        >
                          <p className="text-sm font-semibold">
                            {registro.usuario?.nome ?? 'Participante sem nome'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Etapa atual: {registro.etapaAtual ?? 1}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={
                                registro.concluido
                                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                  : 'border-slate-200 bg-slate-100 text-slate-700'
                              }
                            >
                              {registro.concluido ? 'Concluída' : 'Em andamento'}
                            </Badge>
                            {registro.dataInicio ? (
                              <span>Início: {formatDateTime(registro.dataInicio)}</span>
                            ) : null}
                            {registro.dataConclusao ? (
                              <span>Conclusão: {formatDateTime(registro.dataConclusao)}</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum participante vinculado a esta trilha.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Histórico de solicitações
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      <span>
                        Atualizado{' '}
                        {solicitacoesHistoricoQuery.isLoading
                          ? 'carregando...'
                          : formatDateTime(new Date())}
                      </span>
                    </div>
                  </div>
                  {solicitacoesHistoricoQuery.isError ? (
                    <p className="text-sm text-destructive">
                      Não foi possível carregar o histórico de solicitações.
                    </p>
                  ) : solicitacoesHistoricoQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando solicitações...</p>
                  ) : solicitacoesHistorico.length ? (
                    <div className="space-y-3">
                      {solicitacoesHistorico.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border/40 bg-background/40 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">
                                {item.usuario?.nome ?? 'Discípulo não identificado'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Enviado em {formatDateTime(item.dataSolicitacao)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={STATUS_BADGE_STYLES[item.status]}
                            >
                              {STATUS_LABEL[item.status]}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Líder solicitante: {item.liderSolicitante?.nome ?? 'Não informado'}
                          </p>
                          {item.dataResposta ? (
                            <p className="text-xs text-muted-foreground">
                              Última atualização: {formatDateTime(item.dataResposta)}
                            </p>
                          ) : null}
                          {item.observacoesSupervisor ? (
                            <p className="mt-2 rounded-md border border-border/40 bg-muted/30 p-2 text-xs text-muted-foreground">
                              Observações: {item.observacoesSupervisor}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma solicitação registrada para esta trilha.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">
                    Exportar relatório
                  </Button>
                  <Button size="sm">Gerenciar trilha</Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Selecione uma trilha para visualizar detalhes.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
