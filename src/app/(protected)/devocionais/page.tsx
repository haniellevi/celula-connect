"use client";

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import {
  useDevocionais,
  useCreateDevocional,
  useUpdateDevocional,
  useDeleteDevocional,
  type Devocional,
  type CreateDevocionalInput,
} from '@/hooks/use-devocionais'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, BookOpen, Flame, Edit3, Trash2 } from 'lucide-react'

interface DevocionalFormValues {
  titulo: string
  versiculoReferencia: string
  versiculoTexto: string
  conteudo: string
  dataDevocional: string
  ativo: boolean
}

function defaultValues(): DevocionalFormValues {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    titulo: '',
    versiculoReferencia: '',
    versiculoTexto: '',
    conteudo: '',
    dataDevocional: hoje,
    ativo: true,
  }
}

const STATUS_FILTERS = ['ativos', 'agendados', 'arquivados', 'todos'] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]

export default function DevocionaisPage() {
  useSetPageMetadata({
    title: 'Devocionais',
    description: 'Publique conteúdos inspiracionais e organize o calendário semanal.',
    breadcrumbs: [
      { label: 'Início', href: '/dashboard' },
      { label: 'Comunicação' },
      { label: 'Devocionais' },
    ],
  })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativos')
  const [editingDevocional, setEditingDevocional] = useState<Devocional | null>(null)
  const [selectedDevocionalId, setSelectedDevocionalId] = useState<string | null>(null)

  const devocionaisQuery = useDevocionais({ take: 200, ativos: statusFilter === 'arquivados' ? false : statusFilter === 'todos' ? undefined : true })
  const createDevocional = useCreateDevocional()
  const updateDevocional = useUpdateDevocional()
  const deleteDevocional = useDeleteDevocional()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DevocionalFormValues>({ defaultValues: defaultValues() })

  useEffect(() => {
    if (editingDevocional) {
      setValue('titulo', editingDevocional.titulo)
      setValue('versiculoReferencia', editingDevocional.versiculoReferencia)
      setValue('versiculoTexto', editingDevocional.versiculoTexto)
      setValue('conteudo', editingDevocional.conteudo)
      setValue('dataDevocional', new Date(editingDevocional.dataDevocional).toISOString().slice(0, 10))
      setValue('ativo', editingDevocional.ativo)
    }
  }, [editingDevocional, setValue])

  const devocionais = useMemo(() => devocionaisQuery.data?.data ?? [], [devocionaisQuery.data?.data])

  const filteredDevocionais = useMemo(() => {
    const agora = new Date()
    return devocionais
      .filter((devocional) => {
        if (statusFilter === 'arquivados') {
          return !devocional.ativo
        }
        if (statusFilter === 'agendados') {
          return new Date(devocional.dataDevocional) > agora && devocional.ativo
        }
        if (statusFilter === 'ativos') {
          return devocional.ativo && new Date(devocional.dataDevocional) <= agora
        }
        return true
      })
      .sort((a, b) => new Date(a.dataDevocional).getTime() - new Date(b.dataDevocional).getTime())
  }, [devocionais, statusFilter])

  const proximoDevocional = useMemo(() => {
    const agora = new Date()
    return devocionais
      .filter((devocional) => devocional.ativo && new Date(devocional.dataDevocional) >= agora)
      .sort((a, b) => new Date(a.dataDevocional).getTime() - new Date(b.dataDevocional).getTime())[0]
  }, [devocionais])

  const metrics = useMemo(() => {
    const agora = new Date()
    const total = devocionais.length
    const ativos = devocionais.filter((devocional) => devocional.ativo && new Date(devocional.dataDevocional) <= agora).length
    const agendados = devocionais.filter((devocional) => devocional.ativo && new Date(devocional.dataDevocional) > agora).length
    const arquivados = devocionais.filter((devocional) => !devocional.ativo).length
    return { total, ativos, agendados, arquivados }
  }, [devocionais])

  function resetForm() {
    setEditingDevocional(null)
    reset(defaultValues())
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateDevocionalInput = {
      titulo: values.titulo.trim(),
      versiculoReferencia: values.versiculoReferencia.trim(),
      versiculoTexto: values.versiculoTexto.trim(),
      conteudo: values.conteudo.trim(),
      dataDevocional: values.dataDevocional,
      ativo: values.ativo,
    }

    try {
      if (editingDevocional) {
        await updateDevocional.mutateAsync({
          id: editingDevocional.id,
          data: {
            ...payload,
          },
        })
      } else {
        await createDevocional.mutateAsync(payload)
      }
      resetForm()
    } catch {
      // feedback tratado pelos hooks
    }
  })

  async function handleDelete(devocional: Devocional) {
    const confirmar = window.confirm(`Remover o devocional "${devocional.titulo}"?`)
    if (!confirmar) return
    await deleteDevocional.mutateAsync(devocional.id)
    if (editingDevocional?.id === devocional.id) {
      resetForm()
    }
  }

  useEffect(() => {
    if (!selectedDevocionalId && filteredDevocionais.length) {
      setSelectedDevocionalId(filteredDevocionais[0].id)
    }
  }, [filteredDevocionais, selectedDevocionalId])

  const devocionalSelecionado = useMemo(
    () => filteredDevocionais.find((devocional) => devocional.id === selectedDevocionalId) ?? null,
    [filteredDevocionais, selectedDevocionalId],
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingDevocional ? 'Editar devocional' : 'Novo devocional'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina o conteúdo que será disponibilizado para as células e dashboards de comunicação.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Confiança em tempos difíceis" {...register('titulo', { required: true })} />
              {errors.titulo ? <p className="text-xs text-destructive">Informe um título.</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="versiculoReferencia">Referência bíblica</Label>
              <Input id="versiculoReferencia" placeholder="Salmo 27:1" {...register('versiculoReferencia', { required: true })} />
              {errors.versiculoReferencia ? (
                <p className="text-xs text-destructive">Informe a referência bíblica.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="versiculoTexto">Texto do versículo</Label>
              <Textarea id="versiculoTexto" rows={2} {...register('versiculoTexto', { required: true })} />
              {errors.versiculoTexto ? <p className="text-xs text-destructive">Inclua o texto do versículo.</p> : null}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="conteudo">Conteúdo completo</Label>
              <Textarea
                id="conteudo"
                rows={4}
                placeholder="Aplicação prática, reflexões e desafios para a célula."
                {...register('conteudo', { required: true })}
              />
              {errors.conteudo ? <p className="text-xs text-destructive">Descreva o conteúdo do devocional.</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataDevocional">Data</Label>
              <Input id="dataDevocional" type="date" {...register('dataDevocional', { required: true })} />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ativo"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register('ativo')}
              />
              <Label htmlFor="ativo" className="text-sm">
                Devocional ativo
              </Label>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={createDevocional.isPending || updateDevocional.isPending}>
                {editingDevocional
                  ? updateDevocional.isPending
                    ? 'Atualizando...'
                    : 'Atualizar devocional'
                  : createDevocional.isPending
                  ? 'Publicando...'
                  : 'Publicar devocional'}
              </Button>
              {editingDevocional ? (
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
            <CardTitle>Total publicados</CardTitle>
            <Badge variant="outline">{metrics.total}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Devocionais cadastrados no sistema, incluindo agendados e arquivados.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Disponíveis hoje</CardTitle>
            <Badge variant="outline">{metrics.ativos}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Conteúdos ativos para uso imediato pelas células e dashboards.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Agendados</CardTitle>
            <Badge variant="outline">{metrics.agendados}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Devocionais futuros — mantenha o calendário sempre preenchido.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Arquivados</CardTitle>
            <Badge variant="outline">{metrics.arquivados}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Conteúdos desativados; revise periodicamente para reativar ou remover.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Agenda de devocionais
            </CardTitle>
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <TabsList>
                {STATUS_FILTERS.map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {status}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            {devocionaisQuery.isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : filteredDevocionais.length ? (
              <ScrollArea className="h-[520px]">
                <ul className="divide-y divide-border/40">
                  {filteredDevocionais.map((devocional) => {
                    const agora = new Date()
                    const data = new Date(devocional.dataDevocional)
                    const ativo = devocional.ativo && data >= agora
                    return (
                      <li key={devocional.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedDevocionalId(devocional.id)}
                          className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${
                            devocional.id === selectedDevocionalId ? 'bg-accent/40' : 'hover:bg-accent/20'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-sm">{devocional.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.toLocaleDateString('pt-BR')} · {devocional.versiculoReferencia}
                            </p>
                          </div>
                          <Badge variant={ativo ? 'outline' : 'secondary'}>
                            {ativo ? 'Agendado' : devocional.ativo ? 'Disponível' : 'Arquivado'}
                          </Badge>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">Nenhum devocional para o filtro selecionado.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Conteúdo selecionado
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Pré-visualização completa para validar copy, versículos e aplicação prática.
              </p>
            </div>
            {devocionalSelecionado ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingDevocional(devocionalSelecionado)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(devocionalSelecionado)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remover
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {devocionalSelecionado ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">{devocionalSelecionado.versiculoReferencia}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {devocionalSelecionado.versiculoTexto}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/50 p-4 text-sm whitespace-pre-line leading-relaxed">
                  {devocionalSelecionado.conteudo}
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-5 w-5" />
                Selecione um devocional para visualizar os detalhes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {proximoDevocional ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Próximo devocional agendado
            </CardTitle>
            <Badge variant="secondary">{new Date(proximoDevocional.dataDevocional).toLocaleDateString('pt-BR')}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">{proximoDevocional.titulo}</p>
            <p className="text-xs text-muted-foreground mb-3">{proximoDevocional.versiculoReferencia}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {proximoDevocional.conteudo.slice(0, 240)}...
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
