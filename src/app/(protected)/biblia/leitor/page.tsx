"use client";

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2 } from 'lucide-react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import {
  useBibliaCapitulos,
  useBibliaLivros,
  useBibliaMetasUsuario,
  useRegistrarLeitura,
  type CapituloComVersiculos,
  type LivroBiblia,
} from '@/hooks/use-biblia'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type LivroOption = Pick<LivroBiblia, 'id' | 'codigo' | 'nome' | 'abreviacao' | 'testamento' | 'ordem'>

export default function BibliaLeitorPage() {
  const [selectedLivroId, setSelectedLivroId] = useState<string>()
  const [selectedCapituloId, setSelectedCapituloId] = useState<string>()
  const [selectedMetaId, setSelectedMetaId] = useState<string>('none')
  const [tempoLeituraMinutos, setTempoLeituraMinutos] = useState<string>('15')

  const livrosQuery = useBibliaLivros({ take: 200 })
  const capitulosQuery = useBibliaCapitulos(selectedLivroId, {
    includeVersiculos: true,
    take: 200,
    enabled: Boolean(selectedLivroId),
  })
  const metasUsuarioQuery = useBibliaMetasUsuario('me', {
    includeMeta: true,
    includeProgresso: true,
    take: 50,
  })
  const registrarLeitura = useRegistrarLeitura()
  const { toast } = useToast()

  useSetPageMetadata({
    title: 'Leitor Bíblico',
    description: 'Leia capítulos com base nas metas da sua célula e acompanhe o progresso.',
    breadcrumbs: [
      { label: 'Início', href: '/dashboard' },
      { label: 'Bíblia', href: '/biblia/leitor' },
      { label: 'Leitor' },
    ],
  })

  const livros: LivroOption[] = useMemo(
    () =>
      (livrosQuery.data?.data ?? []).map((livro) => ({
        id: livro.id,
        codigo: livro.codigo,
        nome: livro.nome,
        abreviacao: livro.abreviacao,
        testamento: livro.testamento,
        ordem: livro.ordem,
      })),
    [livrosQuery.data?.data],
  )

  useEffect(() => {
    if (!selectedLivroId && livros.length) {
      setSelectedLivroId(livros[0].id)
    }
  }, [livros, selectedLivroId])

  const capitulos = useMemo(
    () => capitulosQuery.data?.data ?? [],
    [capitulosQuery.data?.data],
  )

  useEffect(() => {
    if (!selectedCapituloId && capitulos.length) {
      setSelectedCapituloId(capitulos[0].id)
    }
  }, [capitulos, selectedCapituloId])

  const livroSelecionado = livros.find((livro) => livro.id === selectedLivroId)
  const capituloSelecionado: CapituloComVersiculos | undefined = useMemo(
    () => capitulos.find((cap) => cap.id === selectedCapituloId),
    [capitulos, selectedCapituloId],
  )

  const metasUsuario = useMemo(
    () => metasUsuarioQuery.data?.data ?? [],
    [metasUsuarioQuery.data?.data],
  )

  async function handleRegistrarLeitura() {
    if (!livroSelecionado || !capituloSelecionado) {
      toast({
        title: 'Selecione livro e capítulo',
        description: 'Escolha um livro e capítulo antes de registrar a leitura.',
        variant: 'destructive',
      })
      return
    }

    const tempoMinutos = tempoLeituraMinutos.trim()
      ? Number.parseInt(tempoLeituraMinutos, 10)
      : undefined
    if (tempoMinutos !== undefined && Number.isNaN(tempoMinutos)) {
      toast({
        title: 'Tempo inválido',
        description: 'Informe o tempo em minutos como um número inteiro.',
        variant: 'destructive',
      })
      return
    }

    try {
      await registrarLeitura.mutateAsync({
        livroCodigo: livroSelecionado.codigo,
        capitulo: capituloSelecionado.numero,
        tempoLeitura: tempoMinutos,
        metaId: selectedMetaId !== 'none' ? selectedMetaId : undefined,
      })
      toast({
        title: 'Leitura registrada',
        description: `Capítulo ${capituloSelecionado.numero} de ${livroSelecionado.nome} marcado como lido.`,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível registrar a leitura.'
      toast({
        title: 'Erro ao registrar leitura',
        description: message,
        variant: 'destructive',
      })
    }
  }

  const isLoadingLivros = livrosQuery.isLoading && !livros.length
  const isLoadingCapitulos = capitulosQuery.isLoading && !capitulos.length

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Livros
          </CardTitle>
          <Badge variant="secondary">{livros.length} livros</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLivros ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            <ScrollArea className="h-[420px] lg:h-[calc(100vh-10rem)]">
              <nav className="flex flex-col gap-1 p-2">
                {livros.map((livro) => {
                  const isActive = livro.id === selectedLivroId
                  return (
                    <button
                      key={livro.id}
                      type="button"
                      onClick={() => {
                        setSelectedLivroId(livro.id)
                        setSelectedCapituloId(undefined)
                      }}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <span className="font-medium">{livro.nome}</span>
                      <Badge variant="outline" className="ml-2">
                        {livro.testamento}
                      </Badge>
                    </button>
                  )
                })}
              </nav>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{livroSelecionado?.nome ?? 'Selecione um livro'}</CardTitle>
                {livroSelecionado ? (
                  <p className="text-sm text-muted-foreground">
                    {livroSelecionado?.abreviacao} · Testamento {livroSelecionado.testamento}
                  </p>
                ) : null}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/biblia/metas">Ver metas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCapitulos ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : capitulos.length ? (
              <Fragment>
                <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="rounded-md border border-border/40">
                    <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Capítulos</p>
                    <ScrollArea className="h-48">
                      <ul className="space-y-1 p-2">
                        {capitulos.map((capitulo) => {
                          const isActive = capitulo.id === selectedCapituloId
                          return (
                            <li key={capitulo.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedCapituloId(capitulo.id)}
                                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                Capítulo {capitulo.numero}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="min-h-[320px] rounded-md border border-border/40 p-4">
                    {capituloSelecionado ? (
                      <ScrollArea className="h-[320px] pr-4">
                        <article className="space-y-3">
                          {capituloSelecionado.versiculosBiblia?.map((versiculo) => (
                            <p key={versiculo.id} className="text-sm leading-relaxed">
                              <span className="mr-2 font-semibold text-muted-foreground">
                                {capituloSelecionado.numero}:{versiculo.numero}
                              </span>
                              {versiculo.texto}
                            </p>
                          ))}
                        </article>
                      </ScrollArea>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        {capitulosQuery.isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-label="Carregando capítulo selecionado" />
                        ) : (
                          'Selecione um capítulo para visualizar os versículos.'
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-md border border-border/40 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Registrar leitura deste capítulo
                    </h3>
                    <Badge variant="secondary">
                      {metasUsuario.length ? `${metasUsuario.length} metas disponíveis` : 'Sem metas atribuídas'}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="meta-select">Meta (opcional)</Label>
                      <Select
                        value={selectedMetaId}
                        onValueChange={setSelectedMetaId}
                        disabled={metasUsuarioQuery.isLoading || metasUsuario.length === 0}
                      >
                        <SelectTrigger id="meta-select">
                          <SelectValue placeholder="Selecionar meta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem meta específica</SelectItem>
                          {metasUsuario.map((metaUsuario) => (
                            <SelectItem key={metaUsuario.id} value={metaUsuario.metaId}>
                              {metaUsuario.meta?.titulo ?? 'Meta sem título'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tempo-leitura">Tempo (minutos)</Label>
                      <Input
                        id="tempo-leitura"
                        type="number"
                        min={1}
                        max={600}
                        value={tempoLeituraMinutos}
                        onChange={(event) => setTempoLeituraMinutos(event.target.value)}
                        placeholder="15"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleRegistrarLeitura}
                        disabled={registrarLeitura.isPending || !capituloSelecionado || !livroSelecionado}
                      >
                        {registrarLeitura.isPending ? (
                          <Fragment>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </Fragment>
                        ) : (
                          'Registrar leitura'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Fragment>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum capítulo encontrado para este livro.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Minhas metas
              <Badge variant="secondary">{metasUsuario.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metasUsuarioQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : metasUsuario.length ? (
              <Fragment>
                {metasUsuario.map((metaUsuario) => {
                  const meta = metaUsuario.meta
                  const progressoAlvo = meta?.valorMeta ?? 0
                  const progressoAtual = metaUsuario.progressoAtual
                  const percentual =
                    progressoAlvo > 0 ? Math.min(100, Math.round((progressoAtual / progressoAlvo) * 100)) : 0
                  return (
                    <div
                      key={metaUsuario.id}
                      className="rounded-lg border border-border/40 bg-background/40 p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{meta?.titulo ?? 'Meta sem título'}</p>
                        <Badge variant={metaUsuario.ativa ? 'outline' : 'secondary'}>
                          {metaUsuario.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {progressoAtual} / {progressoAlvo || '—'} concluído · {percentual}%
                      </p>
                    </div>
                    </div>
                  )
                })}
              </Fragment>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma meta atribuída a você no momento. Atribua metas para acompanhar o progresso automaticamente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
