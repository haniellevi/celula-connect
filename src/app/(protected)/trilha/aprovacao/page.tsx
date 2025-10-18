"use client";

import { useEffect, useMemo, useState } from 'react'
import {
  PerfilUsuario,
  StatusSolicitacao,
} from '@/lib/prisma-client'
import { useTrilhaSolicitacoes, useUpdateSolicitacaoTrilha } from '@/hooks/use-trilha-solicitacoes'
import { useDomainUser } from '@/hooks/use-domain-user'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { SolicitacaoTrilhaWithRelations } from '@/hooks/use-trilha-solicitacoes'

type StatusFilterValue = StatusSolicitacao | 'TODAS'
type ScopeOption = 'mine' | 'lider' | 'pendentes' | 'all'

const STATUS_LABELS: Record<StatusSolicitacao, { label: string; className: string; description: string }> = {
  [StatusSolicitacao.PENDENTE]: {
    label: 'Pendente',
    className: 'border-amber-200 bg-amber-100 text-amber-800',
    description: 'Aguardando revisão de supervisores',
  },
  [StatusSolicitacao.APROVADA]: {
    label: 'Aprovada',
    className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    description: 'Solicitações liberadas para próxima etapa',
  },
  [StatusSolicitacao.REJEITADA]: {
    label: 'Rejeitada',
    className: 'border-rose-200 bg-rose-100 text-rose-700',
    description: 'Solicitações recusadas ou reenviadas',
  },
}

const STATUS_TABS: Array<{ value: StatusFilterValue; label: string }> = [
  { value: 'TODAS', label: 'Todas' },
  { value: StatusSolicitacao.PENDENTE, label: 'Pendentes' },
  { value: StatusSolicitacao.APROVADA, label: 'Aprovadas' },
  { value: StatusSolicitacao.REJEITADA, label: 'Rejeitadas' },
]

function getInitials(nome?: string | null) {
  if (!nome) return '??'
  const [first = '', second = ''] = nome.split(' ')
  return `${first.charAt(0) ?? ''}${second.charAt(0) ?? ''}`.toUpperCase() || first.slice(0, 2).toUpperCase()
}

function formatDate(date?: string | Date | null) {
  if (!date) return 'Não informado'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function TrilhaAprovacaoPage() {
  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data ?? null
  const canReview =
    domainUser?.perfil === PerfilUsuario.SUPERVISOR || domainUser?.perfil === PerfilUsuario.PASTOR

  const defaultScope: ScopeOption = useMemo(() => {
    if (!domainUser) return 'mine'
    switch (domainUser.perfil) {
      case PerfilUsuario.PASTOR:
      case PerfilUsuario.SUPERVISOR:
        return 'all'
      case PerfilUsuario.LIDER_CELULA:
        return 'lider'
      default:
        return 'mine'
    }
  }, [domainUser])

  const [scope, setScope] = useState<ScopeOption>(defaultScope)
  useEffect(() => {
    setScope(defaultScope)
  }, [defaultScope])

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(
    canReview ? StatusSolicitacao.PENDENTE : 'TODAS',
  )

  useSetPageMetadata({
    title: "Sistema de Aprovação",
    description:
      "Gerencie solicitações de avanço na trilha de crescimento, acompanhe decisões e registre observações.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Trilha", href: "/trilha" },
      { label: "Aprovação" },
    ],
  })

  const solicitacoesQuery = useTrilhaSolicitacoes({
    scope,
    includeArea: true,
    includeLider: true,
    includeTrilha: true,
    includeUsuario: true,
    includeSupervisor: true,
    take: 100,
    enabled: Boolean(domainUser),
  })

  const solicitacoes = useMemo(
    () => solicitacoesQuery.data?.data ?? [],
    [solicitacoesQuery.data],
  )
  const statusCounts = useMemo(
    () =>
      solicitacoes.reduce(
        (acc, solicitacao) => {
          acc.total += 1
          if (solicitacao.status in acc.byStatus) {
            acc.byStatus[solicitacao.status as StatusSolicitacao] += 1
          }
          return acc
        },
        {
          total: solicitacoes.length,
          byStatus: {
            [StatusSolicitacao.PENDENTE]: 0,
            [StatusSolicitacao.APROVADA]: 0,
            [StatusSolicitacao.REJEITADA]: 0,
          },
        },
      ),
    [solicitacoes],
  )

  const filteredSolicitacoes = useMemo(() => {
    if (statusFilter === 'TODAS') return solicitacoes
    return solicitacoes.filter((item) => item.status === statusFilter)
  }, [solicitacoes, statusFilter])

  const latestSolicitacoes = useMemo(
    () =>
      solicitacoes
        .slice()
        .sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime())
        .slice(0, 3),
    [solicitacoes],
  )

  const [selectedSolicitacao, setSelectedSolicitacao] =
    useState<SolicitacaoTrilhaWithRelations | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [supervisorNotes, setSupervisorNotes] = useState('')
  const updateSolicitacao = useUpdateSolicitacaoTrilha()

  useEffect(() => {
    if (!dialogOpen) {
      setSupervisorNotes('')
      return
    }
    setSupervisorNotes(selectedSolicitacao?.observacoesSupervisor ?? '')
  }, [dialogOpen, selectedSolicitacao])

  const openSolicitacao = (solicitacao: SolicitacaoTrilhaWithRelations) => {
    setSelectedSolicitacao(solicitacao)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedSolicitacao(null)
  }

  const handleUpdate = (status: StatusSolicitacao) => {
    if (!selectedSolicitacao) return
    const trimmedNotes = supervisorNotes.trim()
    updateSolicitacao.mutate(
      {
        id: selectedSolicitacao.id,
        data: {
          status,
          observacoesSupervisor: trimmedNotes || null,
        },
      },
      {
        onSuccess: () => {
          closeDialog()
        },
      },
    )
  }

  const solicitationRows = filteredSolicitacoes
  const loading = solicitacoesQuery.isLoading || domainUserQuery.isLoading

  const scopeOptions: Array<{ value: ScopeOption; label: string }> = useMemo(() => {
    if (!domainUser) return []
    if (domainUser.perfil === PerfilUsuario.PASTOR || domainUser.perfil === PerfilUsuario.SUPERVISOR) {
      return [
        { value: 'all', label: 'Todas as solicitações' },
        { value: 'pendentes', label: 'Somente pendentes' },
      ]
    }
    return []
  }, [domainUser])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-amber-600">{statusCounts.byStatus[StatusSolicitacao.PENDENTE]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[StatusSolicitacao.PENDENTE].description}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base font-medium">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-emerald-600">{statusCounts.byStatus[StatusSolicitacao.APROVADA]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[StatusSolicitacao.APROVADA].description}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base font-medium">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-rose-600">{statusCounts.byStatus[StatusSolicitacao.REJEITADA]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[StatusSolicitacao.REJEITADA].description}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base font-medium">Últimas decisões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestSolicitacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma solicitação registrada ainda.</p>
            ) : (
              latestSolicitacoes.map((solicitacao) => (
                <div key={solicitacao.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{solicitacao.usuario?.nome ?? 'Usuário não identificado'}</span>
                    <span className="text-muted-foreground">{solicitacao.trilha?.titulo ?? 'Trilha não informada'}</span>
                  </div>
                  <Badge variant="outline" className={STATUS_LABELS[solicitacao.status].className}>
                    {STATUS_LABELS[solicitacao.status].label}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                {tab.label}
                <Badge variant="secondary">
                  {tab.value === 'TODAS'
                    ? statusCounts.total
                    : statusCounts.byStatus[tab.value as StatusSolicitacao]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {scopeOptions.length > 0 && (
            <div className="flex items-center gap-3">
              <Label htmlFor="scope">Visão</Label>
              <Select value={scope} onValueChange={(value) => setScope(value as ScopeOption)}>
                <SelectTrigger id="scope" className="w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            data={solicitationRows}
            loading={loading}
            countLabel="solicitações"
            searchPlaceholder="Busque por discípulo, trilha ou status"
            columns={[
              {
                key: 'disciple',
                header: 'Discípulo',
                render: (item) => (
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{getInitials(item.usuario?.nome)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.usuario?.nome ?? 'Não identificado'}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.usuario?.email ?? 'Sem e-mail'}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: 'trilha',
                header: 'Trilha',
                render: (item) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{item.trilha?.titulo ?? 'Trilha não informada'}</span>
                    <span className="text-xs text-muted-foreground">
                      Área: {item.area?.nome ?? 'Sem área vinculada'}
                    </span>
                  </div>
                ),
              },
              {
                key: 'solicitante',
                header: 'Líder solicitante',
                render: (item) => (
                  <div className="flex flex-col text-sm">
                    <span>{item.liderSolicitante?.nome ?? 'Não informado'}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.dataSolicitacao)}
                    </span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (item) => (
                  <Badge variant="outline" className={STATUS_LABELS[item.status].className}>
                    {STATUS_LABELS[item.status].label}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Ações',
                className: 'w-[160px]',
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openSolicitacao(item)}>
                      Ver detalhes
                    </Button>
                    {canReview && item.status === StatusSolicitacao.PENDENTE && (
                      <Button size="sm" onClick={() => openSolicitacao(item)}>
                        Revisar
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            searchKeys={['usuario', 'trilha', 'status']}
            emptyMessage={
              statusFilter === StatusSolicitacao.PENDENTE
                ? 'Nenhuma solicitação pendente para revisar 🎉'
                : 'Nenhuma solicitação encontrada para este filtro.'
            }
          />
        </div>
      </Tabs>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
          else setDialogOpen(true)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
            <DialogDescription>
              Consulte informações do discípulo, contexto da trilha e registre o parecer da supervisão.
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitacao ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Discípulo</p>
                  <p className="font-semibold">{selectedSolicitacao.usuario?.nome ?? 'Não informado'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSolicitacao.usuario?.email ?? 'Sem e-mail cadastrado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trilha</p>
                  <p className="font-semibold">{selectedSolicitacao.trilha?.titulo ?? 'Não informada'}</p>
                  <p className="text-xs text-muted-foreground">
                    Área de supervisão: {selectedSolicitacao.area?.nome ?? 'Não vinculada'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Solicitado por</p>
                  <p>{selectedSolicitacao.liderSolicitante?.nome ?? 'Não identificado'}</p>
                  <p className="text-xs text-muted-foreground">Em {formatDate(selectedSolicitacao.dataSolicitacao)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status atual</p>
                  <Badge variant="outline" className={STATUS_LABELS[selectedSolicitacao.status].className}>
                    {STATUS_LABELS[selectedSolicitacao.status].label}
                  </Badge>
                  {selectedSolicitacao.dataResposta && (
                    <p className="text-xs text-muted-foreground">
                      Última atualização: {formatDate(selectedSolicitacao.dataResposta)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Motivo do pedido</h3>
                <p className="rounded-md border border-border/50 bg-muted/20 p-3 text-sm">
                  {selectedSolicitacao.motivo ?? 'Nenhum motivo informado.'}
                </p>
              </div>

              {selectedSolicitacao.observacoesLider && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Observações do líder</h3>
                  <p className="rounded-md border border-border/50 bg-muted/20 p-3 text-sm">
                    {selectedSolicitacao.observacoesLider}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="supervisor-notes">Observações da supervisão</Label>
                <Textarea
                  id="supervisor-notes"
                  value={supervisorNotes}
                  onChange={(event) => setSupervisorNotes(event.target.value)}
                  placeholder="Registre orientações, condições para aprovação ou justificativas."
                  disabled={!canReview}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma solicitação para visualizar os detalhes.</p>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Fechar
            </Button>
            {canReview && selectedSolicitacao?.status === StatusSolicitacao.PENDENTE && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdate(StatusSolicitacao.REJEITADA)}
                  disabled={updateSolicitacao.isPending}
                >
                  Rejeitar
                </Button>
                <Button
                  onClick={() => handleUpdate(StatusSolicitacao.APROVADA)}
                  disabled={updateSolicitacao.isPending}
                >
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
