"use client";

import Link from 'next/link'
import { useMemo } from 'react'
import { useSetPageMetadata } from '@/contexts/page-metadata'
import { useIgrejas } from '@/hooks/use-igrejas'
import { useCelulas } from '@/hooks/use-celulas'
import { useUsuarios } from '@/hooks/use-usuarios'
import { useBibliaMetas } from '@/hooks/use-biblia'
import { PerfilUsuario } from '../../../../../prisma/generated/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAvisos } from '@/hooks/use-avisos'
import { useDevocionais } from '@/hooks/use-devocionais'
import { useConvites } from '@/hooks/use-convites'
import { useDomainUser } from '@/hooks/use-domain-user'
import { useDomainFeatureFlags } from '@/hooks/use-domain-feature-flags'

export default function DashboardPastorPage() {
  const igrejasQuery = useIgrejas({ includeCelulas: true, includePlano: true })
  const celulasQuery = useCelulas({ includeMembers: true })
  const usuariosQuery = useUsuarios({ includeIgreja: true, take: 200 })
  const bibliaMetasQuery = useBibliaMetas({ includeUsuarios: true, includeLeituras: true, take: 50 })
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
  const avisosQuery = useAvisos({
    igrejaId: domainUser?.igrejaId ?? undefined,
    includeIgreja: true,
    includeCelula: true,
    includeUsuario: true,
    take: 5,
    enabled: Boolean(domainUser),
  })
  const convitesQuery = useConvites({
    includeCelula: true,
    includeConvidadoPor: true,
    includeUsadoPor: true,
    take: 30,
    enabled: Boolean(domainUser),
  })

  useSetPageMetadata({
    title: "Dashboard Pastor",
    description: "Visão executiva das igrejas, células e equipes de liderança.",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Pastor" },
    ],
  })

  const isLoading =
    igrejasQuery.isLoading ||
    celulasQuery.isLoading ||
    usuariosQuery.isLoading ||
    bibliaMetasQuery.isLoading ||
    devocionaisQuery.isLoading ||
    avisosQuery.isLoading ||
    convitesQuery.isLoading ||
    domainUserQuery.isLoading
  const featureFlags = useDomainFeatureFlags()
  const domainMutationsEnabled = featureFlags.data?.data?.ENABLE_DOMAIN_MUTATIONS !== false

  const totalIgrejas = igrejasQuery.data?.data.length ?? 0
  const totalCelulas = celulasQuery.data?.data.length ?? 0
  const totalMembros = (celulasQuery.data?.data ?? []).reduce((acc, celula) => acc + (celula.membros?.length ?? 0), 0)

  const contagemPorPerfil = useMemo(() => {
    const usuarios = usuariosQuery.data?.data ?? []
    return {
      discipulos: usuarios.filter((u) => u.perfil === PerfilUsuario.DISCIPULO).length,
      lideres: usuarios.filter((u) => u.perfil === PerfilUsuario.LIDER_CELULA).length,
      supervisores: usuarios.filter((u) => u.perfil === PerfilUsuario.SUPERVISOR).length,
      pastores: usuarios.filter((u) => u.perfil === PerfilUsuario.PASTOR).length,
    }
  }, [usuariosQuery.data?.data])

  const resumoBiblico = useMemo(() => {
    const metas = bibliaMetasQuery.data?.data ?? []
    const metasAtivas = metas.filter((meta) => meta.ativa)
    const totalParticipantes = metas.reduce((acc, meta) => acc + (meta.usuarios?.length ?? 0), 0)
    const leiturasRegistradas = metas.reduce((acc, meta) => acc + (meta.leituras?.length ?? 0), 0)
    return {
      totalMetas: metas.length,
      metasAtivas: metasAtivas.length,
      participantes: totalParticipantes,
      leituras: leiturasRegistradas,
    }
  }, [bibliaMetasQuery.data?.data])

  const principaisCelulas = useMemo(() => {
    return (celulasQuery.data?.data ?? [])
      .slice()
      .sort((a, b) => (b.membros?.length ?? 0) - (a.membros?.length ?? 0))
      .slice(0, 3)
  }, [celulasQuery.data?.data])
  const devocionais = devocionaisQuery.data?.data ?? []
  const destaqueDevocional = devocionais[0]
  const avisos = avisosQuery.data?.data ?? []
  const convites = convitesQuery.data?.data ?? []
  const convitesPendentes = useMemo(
    () => convites.filter((convite) => !convite.usado),
    [convites],
  )

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    )
  }

  if (!totalIgrejas) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma igreja cadastrada ainda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Utilize o módulo administrativo para criar a primeira igreja e atribuir seus líderes. Com pelo menos uma igreja ativa, este painel exibirá visão consolidada de células, membros e equipes.
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
              As rotas de atualização de igrejas, células e usuários estão bloqueadas. Reative a flag em Admin → Configurações → Feature Flags quando for seguro liberar mutações.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Igrejas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalIgrejas}</p>
            <p className="text-xs text-muted-foreground">incluindo trials e planos pagos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Células</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalCelulas}</p>
            <p className="text-xs text-muted-foreground">visão consolidada entre todas as igrejas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalMembros}</p>
            <p className="text-xs text-muted-foreground">participantes ativos nas células.</p>
          </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liderança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.pastores}</span> pastores</p>
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.supervisores}</span> supervisores</p>
          <p className="text-sm"><span className="font-semibold">{contagemPorPerfil.lideres}</span> líderes de célula</p>
        </CardContent>
      </Card>
    </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximo devocional</CardTitle>
            <p className="text-sm text-muted-foreground">
              Conteúdo em destaque para ser compartilhado com toda a igreja.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {devocionaisQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : destaqueDevocional ? (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    {new Date(destaqueDevocional.dataDevocional).toLocaleDateString('pt-BR', {
                      dateStyle: 'full',
                    })}
                  </p>
                  <h3 className="text-xl font-semibold">{destaqueDevocional.titulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {destaqueDevocional.versiculoReferencia}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {destaqueDevocional.conteudo.slice(0, 240)}
                  {destaqueDevocional.conteudo.length > 240 ? '…' : ''}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {destaqueDevocional.versiculoTexto}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum devocional agendado para os próximos dias. Utilize o módulo administrativo para programar novos conteúdos.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avisos prioritários</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mensagens urgentes e informativas distribuídas para as células.
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
                      Público: {aviso.celula?.nome ?? aviso.igreja?.nome ?? 'Geral'} ·{' '}
                      {new Date(aviso.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {aviso.conteudo.slice(0, 200)}
                      {aviso.conteudo.length > 200 ? '…' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem avisos ativos. Publique comunicados estratégicos para manter a liderança alinhada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Convites por status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Acompanhe os convites emitidos e a efetividade das células.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {convitesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : convites.length ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs uppercase text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold">{convites.length}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs uppercase text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-semibold">{convitesPendentes.length}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs uppercase text-muted-foreground">Convertidos</p>
                    <p className="text-2xl font-semibold">{convites.length - convitesPendentes.length}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {convites.slice(0, 5).map((convite) => (
                    <li key={convite.id} className="rounded border border-border/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{convite.nomeConvidado}</p>
                        <Badge variant={convite.usado ? 'default' : 'outline'}>
                          {convite.usado ? 'Utilizado' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {convite.celula?.nome ?? 'Sem célula'} · expira{' '}
                        {new Date(convite.dataExpiracao).toLocaleDateString('pt-BR')}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum convite registrado ainda. Oriente os líderes a gerar convites pelo painel.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Landing page configurável</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalize chamada principal, CTA e demais blocos da página pública em tempo real.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Utilize o builder dedicado para atualizar o conteúdo da landing page sem precisar de deploy. As alterações são refletidas imediatamente no site público.
            </p>
            <Button asChild>
              <Link href="/dashboard/pastor/landing-config">
                Abrir builder da landing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engajamento bíblico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Metas cadastradas</p>
            <p className="text-2xl font-semibold">{resumoBiblico.totalMetas}</p>
            <p className="text-xs text-muted-foreground">
              {resumoBiblico.metasAtivas} ativas no momento.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Participantes envolvidos</p>
            <p className="text-2xl font-semibold">{resumoBiblico.participantes}</p>
            <p className="text-xs text-muted-foreground">
              Discipuladores e discípulos acompanhando metas.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Leituras registradas</p>
            <p className="text-2xl font-semibold">{resumoBiblico.leituras}</p>
            <p className="text-xs text-muted-foreground">
              Entradas sincronizadas com progresso automático.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Igrejas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {igrejasQuery.data?.data.map((igreja) => (
            <div key={igreja.id} className="rounded-lg border border-border/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{igreja.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {igreja.cidade}, {igreja.estado}
                  </p>
                </div>
                <Badge variant="outline">{igreja.statusAssinatura}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Plano: {igreja.plano?.nome ?? "Não configurado"}
              </p>
              <p className="text-xs text-muted-foreground">
                Células vinculadas: {igreja.celulas?.length ?? 0}
              </p>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" disabled>
                  Configurar plano (em breve)
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Células em destaque</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {principaisCelulas.map((celula) => (
            <div key={celula.id} className="rounded-lg border border-border/40 p-4">
              <h3 className="font-semibold">{celula.nome}</h3>
              <p className="text-xs text-muted-foreground">
                Líder: {celula.lider?.nome ?? "Definir"}
              </p>
              <p className="text-xs text-muted-foreground">
                Membros: {celula.membros?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Última reunião: {celula.reunioes?.length ? new Date(celula.reunioes.slice(-1)[0].data).toLocaleDateString('pt-BR') : "Sem registro"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
