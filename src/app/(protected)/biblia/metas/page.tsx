"use client";

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ClipboardCheck, Target } from 'lucide-react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import {
  useBibliaMetas,
  useCreateMetaLeitura,
  useUpdateMetaLeitura,
  useDeleteMetaLeitura,
  useBibliaMetasSummary,
  type CreateMetaLeituraInput,
  type MetaLeituraWithRelations,
} from '@/hooks/use-biblia'
import { useIgrejas } from '@/hooks/use-igrejas'
import { useCelulas } from '@/hooks/use-celulas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { TipoMeta, UnidadeTempo } from '../../../../../prisma/generated/client'

type MetaFormValues = {
  titulo: string
  descricao?: string | null
  igrejaId: string
  celulaId: string
  tipoMeta: TipoMeta
  valorMeta: number
  unidade: UnidadeTempo
  periodo: string
  dataInicio: string
  dataFim: string
  ativa: boolean
}

function defaultFormValues(): MetaFormValues {
  const today = new Date().toISOString().slice(0, 10)
  return {
    titulo: '',
    descricao: '',
    igrejaId: '',
    celulaId: 'none',
    tipoMeta: TipoMeta.CAPITULOS,
    valorMeta: 12,
    unidade: UnidadeTempo.SEMANA,
    periodo: new Date().getFullYear().toString(),
    dataInicio: today,
    dataFim: today,
    ativa: true,
  }
}

export default function BibliaMetasPage() {
  const metasQuery = useBibliaMetas({ includeUsuarios: true, includeLeituras: true, take: 100 })
  const igrejasQuery = useIgrejas({ includeCelulas: true, take: 100 })
  const celulasQuery = useCelulas({ take: 200 })
  const metasSummaryQuery = useBibliaMetasSummary({ rangeDays: 30 })
  const createMeta = useCreateMetaLeitura()
  const updateMeta = useUpdateMetaLeitura()
  const deleteMeta = useDeleteMetaLeitura()
  const [editingMeta, setEditingMeta] = useState<MetaLeituraWithRelations | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MetaFormValues>({
    defaultValues: defaultFormValues(),
  })

  const watchIgreja = watch('igrejaId')
  const isSaving = createMeta.isPending || updateMeta.isPending

  useSetPageMetadata({
    title: 'Metas de Leitura',
    description: 'Monitore e gerencie metas, participantes e progresso de leitura bíblica.',
    breadcrumbs: [
      { label: 'Início', href: '/dashboard' },
      { label: 'Bíblia', href: '/biblia/leitor' },
      { label: 'Metas' },
    ],
  })

  useEffect(() => {
    if (editingMeta) {
      reset({
        titulo: editingMeta.titulo,
        descricao: editingMeta.descricao ?? '',
        igrejaId: editingMeta.igrejaId,
        celulaId: editingMeta.celulaId ?? 'none',
        tipoMeta: editingMeta.tipoMeta,
        valorMeta: editingMeta.valorMeta,
        unidade: editingMeta.unidade,
        periodo: editingMeta.periodo,
        dataInicio: editingMeta.dataInicio.toISOString().slice(0, 10),
        dataFim: editingMeta.dataFim.toISOString().slice(0, 10),
        ativa: editingMeta.ativa,
      })
    }
  }, [editingMeta, reset])

  const resumo = useMemo(() => {
    const summaryTotals = metasSummaryQuery.data?.data?.totals
    if (summaryTotals) {
      return {
        totalMetas: summaryTotals.totalMetas,
        metasAtivas: summaryTotals.metasAtivas,
        participantes: summaryTotals.participantes,
        participantesAtivos: summaryTotals.participantesAtivos,
        leituras: summaryTotals.leiturasRegistradas,
        leiturasPeriodo: summaryTotals.leiturasPeriodo,
        progressoMedio: summaryTotals.progressoMedio,
        tempoLeituraPeriodo: summaryTotals.tempoLeituraPeriodo,
      }
    }

    const metas = metasQuery.data?.data ?? []
    const metasAtivas = metas.filter((meta) => meta.ativa)
    const participantes = metas.reduce((acc, meta) => acc + (meta.usuarios?.length ?? 0), 0)
    const participantesAtivos = metas.reduce((acc, meta) => {
      if (!meta.usuarios) return acc
      return acc + meta.usuarios.filter((usuario) => usuario.ativa).length
    }, 0)
    const leituras = metas.reduce((acc, meta) => acc + (meta.leituras?.length ?? 0), 0)

    return {
      totalMetas: metas.length,
      metasAtivas: metasAtivas.length,
      participantes,
      participantesAtivos,
      leituras,
      leiturasPeriodo: 0,
      progressoMedio: 0,
      tempoLeituraPeriodo: 0,
    }
  }, [metasQuery.data?.data, metasSummaryQuery.data?.data])

  const breakdown = metasSummaryQuery.data?.data?.breakdown ?? {
    metasPorTipo: {},
    metasPorUnidade: {},
  }
  const history = useMemo(
    () => metasSummaryQuery.data?.data?.history?.leiturasPorDia ?? [],
    [metasSummaryQuery.data?.data?.history?.leiturasPorDia],
  )
  const highlights = metasSummaryQuery.data?.data?.highlights ?? {
    metasEmDestaque: [],
    metasEmRisco: [],
  }
  const rangeDays = metasSummaryQuery.data?.data?.filters?.rangeDays ?? 30
  const formatInteger = useMemo(() => new Intl.NumberFormat('pt-BR'), [])
  const formatDecimal = useMemo(
    () => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    [],
  )
  const tempoMedioPorLeitura =
    resumo.leiturasPeriodo > 0 ? resumo.tempoLeituraPeriodo / resumo.leiturasPeriodo : 0
  const leiturasRecentes = useMemo(
    () => history.filter((item) => item.leituras > 0).slice(-10).reverse(),
    [history],
  )
  const ultimoRegistro = leiturasRecentes[0] ?? null

  const celulasDisponiveis = useMemo(() => {
    const todasCelulas = celulasQuery.data?.data ?? []
    if (!watchIgreja) return todasCelulas
    return todasCelulas.filter((celula) => celula.igrejaId === watchIgreja)
  }, [celulasQuery.data?.data, watchIgreja])

  function resetForm() {
    setEditingMeta(null)
    reset(defaultFormValues())
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateMetaLeituraInput = {
      titulo: values.titulo,
      descricao: values.descricao || undefined,
      igrejaId: values.igrejaId,
      celulaId: values.celulaId && values.celulaId !== 'none' ? values.celulaId : undefined,
      tipoMeta: values.tipoMeta,
      valorMeta: Number(values.valorMeta),
      unidade: values.unidade,
      periodo: values.periodo,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim,
      ativa: values.ativa,
    }

    if (editingMeta) {
      await updateMeta.mutateAsync({ id: editingMeta.id, data: payload })
      resetForm()
      return
    }

    await createMeta.mutateAsync(payload)
    resetForm()
  })

  async function handleDelete(metaId: string) {
    if (!window.confirm('Deseja realmente remover esta meta?')) return
    await deleteMeta.mutateAsync(metaId)
    if (editingMeta?.id === metaId) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingMeta ? 'Editar meta de leitura' : 'Nova meta de leitura'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {editingMeta
              ? 'Atualize os dados da meta selecionada e acompanhe o impacto nas células.'
              : 'Preencha os campos abaixo para criar uma meta vinculada a uma igreja ou célula específica.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Plano anual de leitura"
                {...register('titulo', { required: true, minLength: 3 })}
              />
              {errors.titulo ? (
                <p className="text-xs text-destructive">Informe um título com pelo menos 3 caracteres.</p>
              ) : null}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Detalhes adicionais sobre o plano de leitura."
                rows={3}
                {...register('descricao')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igrejaId">Igreja</Label>
              <select
                id="igrejaId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('igrejaId', { required: true })}
              >
                <option value="">Selecione uma igreja</option>
                {(igrejasQuery.data?.data ?? []).map((igreja) => (
                  <option key={igreja.id} value={igreja.id}>
                    {igreja.nome} · {igreja.cidade}/{igreja.estado}
                  </option>
                ))}
              </select>
              {errors.igrejaId ? (
                <p className="text-xs text-destructive">Selecione a igreja responsável.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celulaId">Célula (opcional)</Label>
              <select
                id="celulaId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('celulaId')}
              >
                <option value="none">Aplicar a toda a igreja</option>
                {celulasDisponiveis.map((celula) => (
                  <option key={celula.id} value={celula.id}>
                    {celula.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoMeta">Tipo</Label>
              <select
                id="tipoMeta"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('tipoMeta', { required: true })}
              >
                {Object.values(TipoMeta).map((value) => (
                  <option key={value} value={value}>
                    {value.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor</Label>
              <Input
                id="valorMeta"
                type="number"
                min={1}
                max={365}
                {...register('valorMeta', { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <select
                id="unidade"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('unidade', { required: true })}
              >
                {Object.values(UnidadeTempo).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Input id="periodo" {...register('periodo', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data início</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data fim</Label>
              <Input id="dataFim" type="date" {...register('dataFim', { required: true })} />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ativa"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register('ativa')}
              />
              <Label htmlFor="ativa" className="text-sm">
                Meta ativa
              </Label>
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSaving}>
                  {editingMeta ? (isSaving ? 'Atualizando...' : 'Atualizar meta') : isSaving ? 'Salvando...' : 'Criar meta'}
                </Button>
                {editingMeta ? (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                    Cancelar edição
                  </Button>
                ) : null}
              </div>
              {createMeta.isError ? (
                <p className="text-xs text-destructive">
                  {(createMeta.error as ApiError)?.message ?? 'Não foi possível criar a meta.'}
                </p>
              ) : null}
              {updateMeta.isError ? (
                <p className="text-xs text-destructive">
                  {(updateMeta.error as ApiError)?.message ?? 'Não foi possível atualizar a meta.'}
                </p>
              ) : null}
              {deleteMeta.isError ? (
                <p className="text-xs text-destructive">
                  {(deleteMeta.error as ApiError)?.message ?? 'Não foi possível remover a meta.'}
                </p>
              ) : null}
              {createMeta.isSuccess && !editingMeta ? (
                <p className="text-xs text-muted-foreground">
                  Meta criada com sucesso. Vincule participantes via módulo de células.
                </p>
              ) : null}
              {updateMeta.isSuccess && editingMeta === null ? (
                <p className="text-xs text-muted-foreground">Meta atualizada com sucesso.</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Metas cadastradas</CardTitle>
            <Badge variant="outline">{formatInteger.format(resumo.totalMetas)}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatInteger.format(resumo.metasAtivas)} metas ativas em acompanhamento nas igrejas e células vinculadas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Participantes ativos</CardTitle>
            <Badge variant="outline">
              {formatInteger.format(resumo.participantesAtivos)}/
              {formatInteger.format(resumo.participantes)}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Discípulos, líderes e auxiliares atualmente engajados com metas de leitura.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Leituras registradas</CardTitle>
            <Badge variant="outline">{formatInteger.format(resumo.leituras)}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatInteger.format(resumo.leiturasPeriodo)} leituras nos últimos {rangeDays} dias ·{' '}
              {formatInteger.format(resumo.tempoLeituraPeriodo)} minutos dedicados (
              {formatDecimal.format(tempoMedioPorLeitura || 0)} min/leitura).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Progresso médio</CardTitle>
            <Badge variant="outline">{formatDecimal.format(resumo.progressoMedio)}%</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Média do progresso atual considerando o total de participantes registrados.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Engajamento recente</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos registros consolidados conforme o leitor bíblico sincroniza novas leituras.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {ultimoRegistro ? (
              <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                <p className="text-xs uppercase text-muted-foreground">Último dia com leitura</p>
                <p className="text-lg font-semibold">
                  {new Date(ultimoRegistro.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatInteger.format(ultimoRegistro.leituras)} leituras ·{' '}
                  {formatInteger.format(ultimoRegistro.tempoTotal)} minutos dedicados
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ainda não há leituras registradas no recorte selecionado.
              </p>
            )}
            <div>
              <p className="text-xs uppercase text-muted-foreground mb-2">Histórico curto</p>
              {leiturasRecentes.length ? (
                <ScrollArea className="h-40 pr-2">
                  <ul className="space-y-2 text-sm">
                    {leiturasRecentes.map((entry) => (
                      <li
                        key={entry.date}
                        className="flex items-center justify-between rounded border border-border/40 px-3 py-2"
                      >
                        <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                        <span className="font-semibold">
                          {formatInteger.format(entry.leituras)} leituras ·{' '}
                          {formatInteger.format(entry.tempoTotal)} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Aguarde novas leituras para acompanhar o engajamento diário.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição das metas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metasSummaryQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Por tipo</p>
                  <ul className="space-y-1">
                    {Object.entries(breakdown.metasPorTipo).length ? (
                      Object.entries(breakdown.metasPorTipo).map(([tipo, total]) => (
                        <li key={tipo} className="flex items-center justify-between text-sm">
                          <span>{tipo.toLowerCase()}</span>
                          <Badge variant="outline">{formatInteger.format(total)}</Badge>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum tipo registrado.</p>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Por unidade</p>
                  <ul className="space-y-1">
                    {Object.entries(breakdown.metasPorUnidade).length ? (
                      Object.entries(breakdown.metasPorUnidade).map(([unidade, total]) => (
                        <li key={unidade} className="flex items-center justify-between text-sm">
                          <span>{unidade.toLowerCase()}</span>
                          <Badge variant="outline">{formatInteger.format(total)}</Badge>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhuma unidade registrada.</p>
                    )}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de leituras</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tendência dos últimos {rangeDays} dias com base nas leituras sincronizadas.
            </p>
          </CardHeader>
          <CardContent>
            {metasSummaryQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : leiturasRecentes.length ? (
              <ScrollArea className="h-56 pr-2">
                <ul className="space-y-2 text-sm">
                  {history.map((entry) => (
                    <li
                      key={entry.date}
                      className="flex items-center justify-between rounded border border-border/40 px-3 py-2"
                    >
                      <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                      <span className="font-semibold">
                        {formatInteger.format(entry.leituras)} leituras ·{' '}
                        {formatInteger.format(entry.tempoTotal)} min
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma leitura registrada no período selecionado.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Metas em destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metasSummaryQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Maior progresso</p>
                  <ul className="space-y-2">
                    {highlights.metasEmDestaque.length ? (
                      highlights.metasEmDestaque.map((meta) => (
                        <li key={meta.id} className="rounded border border-border/40 p-3">
                          <p className="text-sm font-semibold">{meta.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatInteger.format(meta.participantesAtivos)} participantes ativos ·{' '}
                            {formatDecimal.format(meta.progressoMedio)}% concluído
                          </p>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Sem destaques no momento.</p>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Atenção</p>
                  <ul className="space-y-2">
                    {highlights.metasEmRisco.length ? (
                      highlights.metasEmRisco.map((meta) => (
                        <li key={meta.id} className="rounded border border-border/40 p-3">
                          <p className="text-sm font-semibold">{meta.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDecimal.format(meta.progressoMedio)}% concluído ·{' '}
                            {formatInteger.format(meta.diasRestantes)} dias restantes
                          </p>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhuma meta em risco detectada.</p>
                    )}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas por célula/igreja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metasQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : metasQuery.data?.data.length ? (
            <ScrollArea className="h-[540px]">
              <div className="space-y-4 pr-4">
                {metasQuery.data.data.map((meta) => {
                  const participantes = meta.usuarios?.length ?? 0
                  const progressoTotal = meta.usuarios?.reduce((acc, usuario) => acc + usuario.progressoAtual, 0) ?? 0
                  const metaGlobal = meta.valorMeta ?? 0
                  const progressoMedio =
                    participantes && metaGlobal
                      ? Math.round(progressoTotal / (participantes * metaGlobal) * 100)
                      : 0

                  return (
                    <div key={meta.id} className="rounded-lg border border-border/40 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold">{meta.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            Igreja: {meta.igreja?.nome ?? 'Não vinculada'} · Célula:{' '}
                            {meta.celula?.nome ?? 'Aplicação em toda a igreja'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {meta.tipoMeta.toLowerCase()} · {meta.valorMeta} unidades
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMeta(meta)}
                              disabled={isSaving}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(meta.id)}
                              disabled={deleteMeta.isPending}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Participantes</p>
                          <p className="text-base font-semibold">{participantes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Progresso médio</p>
                          <p className="text-base font-semibold">{progressoMedio}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Leituras logadas</p>
                          <p className="text-base font-semibold">{meta.leituras?.length ?? 0}</p>
                        </div>
                      </div>
                      {meta.usuarios?.length ? (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Participantes</p>
                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {meta.usuarios.map((metaUsuario) => (
                              <div
                                key={metaUsuario.id}
                                className="rounded-md border border-border/30 bg-muted/30 p-3"
                              >
                                <p className="text-sm font-medium">{metaUsuario.usuario?.nome ?? 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Progresso: {metaUsuario.progressoAtual}/{meta.valorMeta ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Última atualização:{' '}
                                  {metaUsuario.ultimaAtualizacao
                                    ? new Date(metaUsuario.ultimaAtualizacao).toLocaleDateString('pt-BR')
                                    : 'Sem registro'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <ClipboardCheck className="h-5 w-5" />
              Nenhuma meta de leitura cadastrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
