import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getConviteByToken, registerConviteView } from '@/lib/queries/convites'
import { getCelulaById } from '@/lib/queries/celulas'
import { CargoCelula } from '../../../../../prisma/generated/client'

type InvitationStatus =
  | { status: 'not_found' }
  | {
      status: 'used' | 'expired' | 'valid'
      data: InvitationSnapshot
    }

interface InvitationSnapshot {
  token: string
  nomeConvidado: string
  emailConvidado: string | null
  cargo: CargoCelula | null
  dataExpiracao: Date
  totalVisualizacoes: number
  totalAcessosValidos: number
  ultimaVisualizacaoEm: Date | null
  celula: {
    id: string
    nome: string
    igreja?: {
      id: string
      nome: string
    } | null
  } | null
}

export const dynamic = 'force-dynamic'

async function loadInvitationStatus(token: string): Promise<InvitationStatus> {
  const convite = await getConviteByToken(token)

  if (!convite) {
    return { status: 'not_found' }
  }

  const celulaBase = await getCelulaById(convite.celulaId, {
    igreja: true,
  })

  const agora = new Date()
  const status: 'valid' | 'expired' | 'used' = convite.usado
    ? 'used'
    : convite.dataExpiracao < agora
      ? 'expired'
      : 'valid'

  await registerConviteView(token, status).catch((error) => {
    console.error('Falha ao registrar visualização pública do convite', error)
  })

  const snapshot: InvitationSnapshot = {
    token,
    nomeConvidado: convite.nomeConvidado,
    emailConvidado: convite.emailConvidado,
    cargo: convite.cargo ?? null,
    dataExpiracao: convite.dataExpiracao,
    totalVisualizacoes: convite.totalVisualizacoes + 1,
    totalAcessosValidos:
      status === 'valid' ? convite.totalAcessosValidos + 1 : convite.totalAcessosValidos,
    ultimaVisualizacaoEm: agora,
    celula: celulaBase
      ? {
          id: celulaBase.id,
          nome: celulaBase.nome,
          igreja: celulaBase.igreja
            ? {
                id: celulaBase.igreja.id,
                nome: celulaBase.igreja.nome,
              }
            : null,
        }
      : null,
  }

  if (status === 'used') {
    return { status: 'used', data: snapshot }
  }

  if (status === 'expired') {
    return { status: 'expired', data: snapshot }
  }

  return { status: 'valid', data: snapshot }
}

const cargoLabels: Record<string, string> = {
  MEMBRO: 'Membro',
  LIDER: 'Líder de célula',
  AUXILIAR: 'Auxiliar',
  CO_LIDER: 'Co-líder',
  APOIO: 'Equipe de apoio',
  SUPERVISOR: 'Supervisor',
}

function formatCargo(cargo: CargoCelula | null) {
  if (!cargo) return 'Membro'
  return cargoLabels[cargo] ?? cargo
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function formatDateTime(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const invitation = await loadInvitationStatus(token)

  if (invitation.status === 'valid') {
    const celulaNome = invitation.data.celula?.nome
    return {
      title: celulaNome
        ? `Convite para ${celulaNome} | Célula Connect`
        : 'Convite para célula | Célula Connect',
      description:
        'Confirme sua presença usando o convite recebido e faça parte da comunidade Célula Connect.',
    }
  }

  if (invitation.status === 'expired') {
    return {
      title: 'Convite expirado | Célula Connect',
      description: 'Este convite expirou. Entre em contato com o líder da célula para solicitar um novo envio.',
    }
  }

  if (invitation.status === 'used') {
    return {
      title: 'Convite já utilizado | Célula Connect',
      description: 'O convite informado já foi utilizado. Solicite um novo acesso ao seu líder.',
    }
  }

  return {
    title: 'Convite não encontrado | Célula Connect',
    description: 'Não localizamos um convite válido com o token informado.',
  }
}

export default async function ConvitePublicPage({ params }: PageProps) {
  const { token } = await params
  const invitation = await loadInvitationStatus(token)

  const statusConfig = {
    valid: {
      badge: 'Convite ativo',
      icon: <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden="true" />,
      title: 'Convite confirmado!',
      description:
        'Você foi convidado para fazer parte de uma célula. Revise os detalhes abaixo e conclua seu cadastro em poucos passos.',
    },
    expired: {
      badge: 'Convite expirado',
      icon: <Clock className="h-10 w-10 text-amber-500" aria-hidden="true" />,
      title: 'Este convite expirou',
      description:
        'O período de validade terminou. Peça para o líder da célula reenviar um novo convite para você.',
    },
    used: {
      badge: 'Convite utilizado',
      icon: <AlertTriangle className="h-10 w-10 text-sky-500" aria-hidden="true" />,
      title: 'Convite já utilizado',
      description:
        'Este token já foi usado anteriormente. Caso precise de acesso novamente, solicite um novo convite.',
    },
    not_found: {
      badge: 'Convite inválido',
      icon: <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />,
      title: 'Convite não encontrado',
      description:
        'Não encontramos um convite válido com este link. Verifique o endereço ou fale com quem enviou o convite.',
    },
  } as const

  const config =
    invitation.status === 'valid'
      ? statusConfig.valid
      : invitation.status === 'expired'
        ? statusConfig.expired
        : invitation.status === 'used'
          ? statusConfig.used
          : statusConfig.not_found

  const queryFragment = `?convite=${encodeURIComponent(token)}`

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <Card className="border border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/5 p-4">{config.icon}</div>
          <div className="flex flex-col items-center gap-2">
            <Badge
              variant={
                invitation.status === 'valid'
                  ? 'default'
                  : invitation.status === 'not_found'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {config.badge}
            </Badge>
            <CardTitle className="text-2xl font-semibold">{config.title}</CardTitle>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">{config.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation.status !== 'not_found' ? (
            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Detalhes do convite
              </h2>
              <Separator className="bg-border/60" />
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Convidado</dt>
                  <dd className="font-medium text-foreground">{invitation.data.nomeConvidado}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">E-mail informado</dt>
                  <dd className="font-medium text-foreground">
                    {invitation.data.emailConvidado ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cargo ao ingressar</dt>
                  <dd className="font-medium text-foreground">{formatCargo(invitation.data.cargo)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Válido até</dt>
                  <dd className="font-medium text-foreground">{formatDate(invitation.data.dataExpiracao)}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">Célula</dt>
                  <dd className="font-medium text-foreground">
                    {invitation.data.celula
                      ? invitation.data.celula.nome
                      : 'Célula não encontrada'}
                  </dd>
                  {invitation.data.celula?.igreja ? (
                    <p className="text-xs text-muted-foreground">
                      Igreja responsável: {invitation.data.celula.igreja.nome}
                    </p>
                  ) : null}
                </div>
                <div>
                  <dt className="text-muted-foreground">Visualizações totais</dt>
                  <dd className="font-medium text-foreground">{invitation.data.totalVisualizacoes}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Acessos válidos</dt>
                  <dd className="font-medium text-foreground">{invitation.data.totalAcessosValidos}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">Último acesso registrado</dt>
                  <dd className="font-medium text-foreground">
                    {formatDateTime(invitation.data.ultimaVisualizacaoEm)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {invitation.status === 'valid' ? (
            <div className="space-y-3 rounded-lg border border-emerald-300/40 bg-emerald-50/40 p-5 dark:border-emerald-700/40 dark:bg-emerald-500/5">
              <p className="text-sm text-emerald-700 dark:text-emerald-200">
                Para concluir o ingresso, entre com a sua conta ou crie um cadastro usando o mesmo
                e-mail informado acima. O convíte será automaticamente vinculado após o login.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button className="flex-1" asChild>
                  <Link href={`/sign-up${queryFragment}`}>Criar minha conta</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/sign-in${queryFragment}`}>Já tenho conta</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {invitation.status === 'expired' || invitation.status === 'used' ? (
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
              <p>
                Precisa de um novo acesso? Entre em contato com o líder da célula para que ele envie
                outro convite válido com um novo prazo de expiração.
              </p>
              <Button variant="ghost" className="self-start" asChild>
                <Link href="/">Voltar para a página inicial</Link>
              </Button>
            </div>
          ) : null}

          {invitation.status === 'not_found' ? (
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
              <p>
                Se você recebeu este link recentemente, confirme com a pessoa que enviou se o token
                foi digitado corretamente ou solicite um novo convite.
              </p>
              <Button variant="ghost" className="self-start" asChild>
                <Link href="/">Ver funcionalidades da plataforma</Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
