"use client";

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { TipoAviso, PrioridadeAviso } from '@/types/avisos'
import { TIPO_AVISO_VALUES, PRIORIDADE_AVISO_VALUES } from '@/types/avisos'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import {
  useAvisos,
  useCreateAviso,
  useUpdateAviso,
  useDeleteAviso,
  type AvisoWithRelations,
  type CreateAvisoInput,
} from '@/hooks/use-avisos'
import { useIgrejas } from '@/hooks/use-igrejas'
import { useCelulas } from '@/hooks/use-celulas'
import { useDomainUser } from '@/hooks/use-domain-user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Megaphone, Check, Trash2, Edit3, Filter } from 'lucide-react'

interface AvisoFormValues {
  titulo: string
  conteudo: string
  tipo: TipoAviso
  prioridade: PrioridadeAviso
  dataInicio: string
  dataFim: string | null
  igrejaId: string
  celulaId: string
  usuarioId: string
  ativo: boolean
}

function defaultFormValues(): AvisoFormValues {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    titulo: '',
    conteudo: '',
    tipo: 'GERAL' as TipoAviso,
    prioridade: 'NORMAL' as PrioridadeAviso,
    dataInicio: hoje,
    dataFim: '',
    igrejaId: '',
    celulaId: 'none',
    usuarioId: 'none',
    ativo: true,
  }
}

const STATUS_FILTERS = ['ativas', 'agendadas', 'expiradas', 'todas'] as const
const PRIORIDADE_FILTERS = ['todas', ...PRIORIDADE_AVISO_VALUES.map((value) => value.toLowerCase() as Lowercase<PrioridadeAviso>)] as const
const TIPO_FILTERS = ['todos', ...TIPO_AVISO_VALUES.map((value) => value.toLowerCase() as Lowercase<TipoAviso>)] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]
type PrioridadeFilter = (typeof PRIORIDADE_FILTERS)[number]
type TipoFilter = (typeof TIPO_FILTERS)[number]

function resolvePrioridade(filter: PrioridadeFilter): PrioridadeAviso | undefined {
  if (filter === 'todas') return undefined
  return filter.toUpperCase() as PrioridadeAviso
}

function resolveTipo(filter: TipoFilter): TipoAviso | undefined {
  if (filter === 'todos') return undefined
  return filter.toUpperCase() as TipoAviso
}

export default function AvisosPage() {
  useSetPageMetadata({
    title: 'Central de Avisos',
    description: 'Planeje e distribua comunicados com segmentação inteligente.',
    breadcrumbs: [
      { label: 'Início', href: '/dashboard' },
      { label: 'Comunicação' },
      { label: 'Avisos' },
    ],
  })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativas')
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeFilter>('todas')
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingAviso, setEditingAviso] = useState<AvisoWithRelations | null>(null)

  const domainUserQuery = useDomainUser(true)
  const domainUser = domainUserQuery.data?.data ?? null
  const igrejasQuery = useIgrejas({ take: 100 })
  const celulasQuery = useCelulas({ take: 200 })

  const prioridadeEnum = resolvePrioridade(prioridadeFilter)
  const tipoEnum = resolveTipo(tipoFilter)

  const avisosQuery = useAvisos({
    includeIgreja: true,
    includeCelula: true,
    includeUsuario: true,
    prioridade: prioridadeEnum,
    tipo: tipoEnum,
    take: 200,
    ativos:
      statusFilter === 'expiradas'
        ? false
        : statusFilter === 'todas'
        ? undefined
        : true,
  })

  const createAviso = useCreateAviso()
  const updateAviso = useUpdateAviso()
  const deleteAviso = useDeleteAviso()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AvisoFormValues>({
    defaultValues: defaultFormValues(),
  })

  const watchIgreja = watch('igrejaId')

  useEffect(() => {
    if (!editingAviso && domainUser?.igrejaId) {
      setValue('igrejaId', domainUser.igrejaId)
    }
  }, [domainUser?.igrejaId, editingAviso, setValue])

  useEffect(() => {
    if (editingAviso) {
      setValue('titulo', editingAviso.titulo)
      setValue('conteudo', editingAviso.conteudo)
      setValue('tipo', editingAviso.tipo)
      setValue('prioridade', editingAviso.prioridade)
      setValue('dataInicio', new Date(editingAviso.dataInicio).toISOString().slice(0, 10))
      setValue(
        'dataFim',
        editingAviso.dataFim ? new Date(editingAviso.dataFim).toISOString().slice(0, 10) : '',
      )
      setValue('igrejaId', editingAviso.igrejaId ?? '')
      setValue('celulaId', editingAviso.celulaId ?? 'none')
      setValue('usuarioId', editingAviso.usuarioId ?? 'none')
      setValue('ativo', editingAviso.ativo)
    }
  }, [editingAviso, setValue])

  const todasCelulas = useMemo(() => celulasQuery.data?.data ?? [], [celulasQuery.data?.data])
  const celulasFiltradas = useMemo(() => {
    if (!watchIgreja) return todasCelulas
    return todasCelulas.filter((celula) => celula.igrejaId === watchIgreja)
  }, [todasCelulas, watchIgreja])

  const avisos = useMemo(() => avisosQuery.data?.data ?? [], [avisosQuery.data?.data])

  const filteredAvisos = useMemo(() => {
    const agora = new Date()
    return avisos
      .filter((aviso) => {
        if (prioridadeEnum && aviso.prioridade !== prioridadeEnum) return false
        if (tipoEnum && aviso.tipo !== tipoEnum) return false
        if (searchTerm.trim()) {
          const normalized = searchTerm.trim().toLowerCase()
          if (
            !(
              aviso.titulo.toLowerCase().includes(normalized) ||
              aviso.conteudo.toLowerCase().includes(normalized)
            )
          )
            return false
        }
        const dataInicio = new Date(aviso.dataInicio)
        const dataFim = aviso.dataFim ? new Date(aviso.dataFim) : null
        if (statusFilter === 'agendadas') {
          return dataInicio > agora
        }
        if (statusFilter === 'expiradas') {
          if (aviso.ativo) return false
          if (dataFim && dataFim >= agora) return false
          return true
        }
        if (statusFilter === 'ativas') {
          const iniciou = dataInicio <= agora
          const naoExpirou = !dataFim || dataFim >= agora
          return aviso.ativo && iniciou && naoExpirou
        }
        return true
      })
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
  }, [avisos, prioridadeEnum, tipoEnum, searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const agora = new Date()
    const total = avisos.length
    let ativas = 0
    let agendadas = 0
    let expiradas = 0
    avisos.forEach((aviso) => {
      const inicio = new Date(aviso.dataInicio)
      const fim = aviso.dataFim ? new Date(aviso.dataFim) : null
      if (!aviso.ativo || (fim && fim < agora)) {
        expiradas += 1
      } else if (inicio > agora) {
        agendadas += 1
      } else {
        ativas += 1
      }
    })
    const urgentes = avisos.filter((aviso) => aviso.prioridade === 'URGENTE').length
    return { total, ativas, agendadas, expiradas, urgentes }
  }, [avisos])

  function resetForm() {
    setEditingAviso(null)
    reset(defaultFormValues())
    if (domainUser?.igrejaId) {
      setValue('igrejaId', domainUser.igrejaId)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const basePayload: CreateAvisoInput = {
      titulo: values.titulo.trim(),
      conteudo: values.conteudo.trim(),
      tipo: values.tipo,
      prioridade: values.prioridade,
      dataInicio: values.dataInicio,
      ativo: values.ativo,
    }
    if (values.dataFim) basePayload.dataFim = values.dataFim
    if (values.igrejaId) basePayload.igrejaId = values.igrejaId
    if (values.celulaId && values.celulaId !== 'none') basePayload.celulaId = values.celulaId
    if (values.usuarioId && values.usuarioId !== 'none') basePayload.usuarioId = values.usuarioId

    try {
      if (editingAviso) {
        await updateAviso.mutateAsync({
          id: editingAviso.id,
          data: {
            ...basePayload,
            dataFim: values.dataFim ? values.dataFim : null,
            igrejaId: values.igrejaId || null,
            celulaId: values.celulaId && values.celulaId !== 'none' ? values.celulaId : null,
            usuarioId: values.usuarioId && values.usuarioId !== 'none' ? values.usuarioId : null,
          },
        })
      } else {
        await createAviso.mutateAsync(basePayload)
      }
      resetForm()
    } catch {
      // feedback já tratado pelos hooks de mutação
    }
  })

  async function handleDelete(aviso: AvisoWithRelations) {
    const confirmado = window.confirm(`Deseja remover o aviso "${aviso.titulo}"?`)
    if (!confirmado) return
    await deleteAviso.mutateAsync(aviso.id)
    if (editingAviso?.id === aviso.id) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingAviso ? 'Editar aviso' : 'Novo aviso'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Crie comunicados segmentados por igreja, célula ou usuário e acompanhe a validade de cada aviso.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Encontro geral de líderes" {...register('titulo', { required: true })} />
              {errors.titulo ? <p className="text-xs text-destructive">Informe um título.</p> : null}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                rows={4}
                placeholder="Detalhes do comunicado, links ou orientações específicas."
                {...register('conteudo', { required: true })}
              />
              {errors.conteudo ? <p className="text-xs text-destructive">Descreva o conteúdo do aviso.</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('tipo', { required: true })}
              >
                {TIPO_AVISO_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('prioridade', { required: true })}
              >
                {PRIORIDADE_AVISO_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Início</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Fim (opcional)</Label>
              <Input id="dataFim" type="date" {...register('dataFim')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igrejaId">Igreja</Label>
              <select
                id="igrejaId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('igrejaId')}
              >
                <option value="">Todos os destinatários</option>
                {(igrejasQuery.data?.data ?? []).map((igreja) => (
                  <option key={igreja.id} value={igreja.id}>
                    {igreja.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="celulaId">Célula (opcional)</Label>
              <select
                id="celulaId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('celulaId')}
              >
                <option value="none">Todas as células</option>
                {celulasFiltradas.map((celula) => (
                  <option key={celula.id} value={celula.id}>
                    {celula.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuarioId">Destinatário específico</Label>
              <Input
                id="usuarioId"
                placeholder="Opcional: ID do usuário"
                {...register('usuarioId')}
              />
              <p className="text-xs text-muted-foreground">Preencha apenas se o aviso for destinado a uma pessoa.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ativo"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register('ativo')}
              />
              <Label htmlFor="ativo" className="text-sm">
                Aviso ativo
              </Label>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={createAviso.isPending || updateAviso.isPending}>
                {editingAviso
                  ? updateAviso.isPending
                    ? 'Atualizando...'
                    : 'Atualizar aviso'
                  : createAviso.isPending
                  ? 'Publicando...'
                  : 'Publicar aviso'}
              </Button>
              {editingAviso ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Total de avisos</CardTitle>
            <Badge variant="outline">{metrics.total}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Comunicação registrada no sistema, incluindo ativos, agendados e expirados.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Ativos agora</CardTitle>
            <Badge variant="outline">{metrics.ativas}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Avisos em vigor neste momento considerando data de início/fim e flag de ativação.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Agendados</CardTitle>
            <Badge variant="outline">{metrics.agendadas}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Comunicados programados para datas futuras — mantenha o backlog sempre alinhado.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Urgentes</CardTitle>
            <Badge variant="destructive">{metrics.urgentes}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Avisos marcados como prioridade URGENTE. Garanta follow-up manual com os responsáveis.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Avisos publicados
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Filtre por status, prioridade ou tipo para revisar campanhas de comunicação.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-[200px] pl-9"
                placeholder="Buscar por título ou conteúdo"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <TabsList>
                {STATUS_FILTERS.map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {status}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={prioridadeFilter}
              onChange={(event) => setPrioridadeFilter(event.target.value as PrioridadeFilter)}
            >
              {PRIORIDADE_FILTERS.map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  prioridade: {prioridade}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={tipoFilter}
              onChange={(event) => setTipoFilter(event.target.value as TipoFilter)}
            >
              {TIPO_FILTERS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  tipo: {tipo}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {avisosQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : filteredAvisos.length ? (
            <ScrollArea className="h-[520px] pr-4">
              <div className="space-y-3">
                {filteredAvisos.map((aviso) => {
                  const inicio = new Date(aviso.dataInicio)
                  const fim = aviso.dataFim ? new Date(aviso.dataFim) : null
                  const agora = new Date()
                  const statusBadge = (() => {
                    if (!aviso.ativo || (fim && fim < agora)) {
                      return <Badge variant="outline" className="border-border/50 text-muted-foreground">Expirado</Badge>
                    }
                    if (inicio > agora) {
                      return <Badge variant="secondary">Agendado</Badge>
                    }
                    return <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700">Ativo</Badge>
                  })()

                  return (
                    <div key={aviso.id} className="rounded-lg border border-border/40 bg-background/50 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-base">{aviso.titulo}</h3>
                            <Badge variant="outline">{aviso.tipo.toLowerCase()}</Badge>
                            <Badge
                              variant={
                                aviso.prioridade === 'URGENTE'
                                  ? 'destructive'
                                  : aviso.prioridade === 'ALTA'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {aviso.prioridade.toLowerCase()}
                            </Badge>
                            {statusBadge}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{aviso.conteudo}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Início: {inicio.toLocaleDateString('pt-BR')}
                            </span>
                            {fim ? (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Fim: {fim.toLocaleDateString('pt-BR')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Vigente até ser desativado
                              </span>
                            )}
                            {aviso.igreja?.nome ? <span>Igreja: {aviso.igreja.nome}</span> : null}
                            {aviso.celula?.nome ? <span>Célula: {aviso.celula.nome}</span> : null}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingAviso(aviso)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(aviso)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Megaphone className="h-5 w-5" />
              Nenhum aviso encontrado para os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
