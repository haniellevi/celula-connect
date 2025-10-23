"use client";

import { useMemo, useState } from 'react'
import { Users, CalendarDays, MapPin, Plus } from 'lucide-react'
import { useCelulas } from '@/hooks/use-celulas'
import { useIgrejas } from '@/hooks/use-igrejas'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { CelulaWithRelations } from '@/hooks/use-celulas'

type StatusFilter = 'ativas' | 'inativas' | 'todas'
type CelulaMember = CelulaWithRelations['membros'][number]

function formatDate(date?: string | Date | null) {
  if (!date) return 'Sem agenda'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function CelulasPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativas')
  const [igrejaFilter, setIgrejaFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useSetPageMetadata({
    title: "Gestão de Células",
    description: "Visão geral das células, lideranças e próximos encontros.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Células" },
    ],
  })

  const igrejasQuery = useIgrejas({ take: 100, includeCelulas: false })
  const celulasQuery = useCelulas({
    includeMembers: true,
    orderBy: 'nome',
    search: searchTerm || undefined,
    ativa:
      statusFilter === 'todas' ? undefined : statusFilter === 'ativas' ? true : false,
    igrejaId: igrejaFilter !== 'all' ? igrejaFilter : undefined,
    take: 200,
  })

  const celulas = useMemo(
    () => celulasQuery.data?.data ?? [],
    [celulasQuery.data],
  )

  const metrics = useMemo(() => {
    const total = celulas.length
    const ativas = celulas.filter((celula) => celula.ativa).length
    const membrosAtivos = celulas.reduce(
      (acc, celula) => acc + (celula.membros?.filter((m: CelulaMember) => m.ativo).length ?? 0),
      0,
    )
    const proximasReunioes = celulas
      .map((celula) => celula.proximaReuniao)
      .filter(Boolean)
      .sort((a, b) => new Date(a ?? 0).getTime() - new Date(b ?? 0).getTime())
    const proximaReuniao = proximasReunioes[0] ?? null

    return {
      total,
      ativas,
      membrosAtivos,
      proximaReuniao,
    }
  }, [celulas])

  const filteredCelulas = useMemo(() => {
    if (!searchTerm) return celulas
    const normalized = searchTerm.trim().toLowerCase()
    return celulas.filter((celula) => {
      const igrejaNome = celula.igreja?.nome?.toLowerCase() ?? ''
      const liderNome = celula.lider?.nome?.toLowerCase() ?? ''
      return (
        celula.nome.toLowerCase().includes(normalized) ||
        igrejaNome.includes(normalized) ||
        liderNome.includes(normalized)
      )
    })
  }, [celulas, searchTerm])

  const statusBadge = (ativa: boolean) =>
    ativa ? (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700">
        Ativa
      </Badge>
    ) : (
      <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
        Inativa
      </Badge>
    )

  const columns = [
    {
      key: 'nome',
      header: 'Célula',
      render: (celula: CelulaWithRelations) => (
        <div className="flex flex-col">
          <span className="font-semibold">{celula.nome}</span>
          <span className="text-xs text-muted-foreground">
            {celula.igreja?.nome ?? 'Igreja não vinculada'}
          </span>
        </div>
      ),
    },
    {
      key: 'lider',
      header: 'Liderança',
      render: (celula: CelulaWithRelations) => (
        <div className="flex flex-col gap-1 text-sm">
          <div>
            <span className="font-medium">{celula.lider?.nome ?? 'Sem líder'}</span>
            <p className="text-xs text-muted-foreground">Líder responsável</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Supervisor: {celula.supervisor?.nome ?? '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'membros',
      header: 'Participantes',
      render: (celula: CelulaWithRelations) => {
        const total = celula.membros?.length ?? 0
        const ativos =
          celula.membros?.filter((membro: CelulaMember) => membro.ativo).length ?? 0
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{ativos} ativos</span>
            <span className="text-xs text-muted-foreground">{total} cadastrados</span>
          </div>
        )
      },
    },
    {
      key: 'reuniao',
      header: 'Próxima reunião',
      render: (celula: CelulaWithRelations) => (
        <div className="flex flex-col text-sm">
          <span>{formatDate(celula.proximaReuniao)}</span>
          {celula.endereco && (
            <span className="text-xs text-muted-foreground">
              {celula.endereco}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (celula: CelulaWithRelations) => statusBadge(celula.ativa),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-[160px]',
      render: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Detalhes
          </Button>
          <Button size="sm">Gerenciar</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Células registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.total}</p>
            <p className="text-sm text-muted-foreground">
              {metrics.ativas} ativas, {metrics.total - metrics.ativas} inativas
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Membros engajados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.membrosAtivos}</p>
            <p className="text-sm text-muted-foreground">Participantes ativos nas células</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próxima reunião
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(metrics.proximaReuniao)}</p>
            <p className="text-sm text-muted-foreground">Atualize o calendário para manter a equipe alinhada</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Plus className="h-4 w-4 text-primary" />
              Próximas ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Planeje multiplicações com base na ocupação das células.</p>
            <p>Use o botão “Gerenciar” para ajustar membros e agenda.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ativas">
              Ativas
              <Badge variant="secondary" className="ml-2">
                {metrics.ativas}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inativas">
              Inativas
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

        <div className="flex items-center gap-3">
          <Select value={igrejaFilter} onValueChange={setIgrejaFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por igreja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as igrejas</SelectItem>
              {(igrejasQuery.data?.data ?? []).map((igreja) => (
                <SelectItem key={igreja.id} value={igreja.id}>
                  {igreja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredCelulas}
        columns={columns}
        loading={celulasQuery.isLoading}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchKeys={['nome']}
        countLabel="células"
        emptyMessage={
          statusFilter === 'ativas'
            ? 'Nenhuma célula ativa encontrada.'
            : 'Nenhuma célula encontrada para os filtros ativos.'
        }
      />
    </div>
  )
}
