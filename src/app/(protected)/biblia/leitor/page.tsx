"use client";

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2 } from 'lucide-react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import {
  useBibliaCapitulos,
  useBibliaLivros,
  type CapituloComVersiculos,
  type LivroBiblia,
} from '@/hooks/use-biblia'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

type LivroOption = Pick<LivroBiblia, 'id' | 'nome' | 'abreviacao' | 'testamento' | 'ordem'>

export default function BibliaLeitorPage() {
  const [selectedLivroId, setSelectedLivroId] = useState<string>()
  const [selectedCapituloId, setSelectedCapituloId] = useState<string>()

  const livrosQuery = useBibliaLivros({ take: 200 })
  const capitulosQuery = useBibliaCapitulos(selectedLivroId, {
    includeVersiculos: true,
    take: 200,
    enabled: Boolean(selectedLivroId),
  })

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

  const capitulos = capitulosQuery.data?.data ?? []

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
                                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
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
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum capítulo encontrado para este livro.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
