"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Coins, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { useDashboard } from '@/hooks/use-dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Falha ao carregar o painel administrativo.</p>
          <p className="mt-1 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      </div>
    )
  }

  const metricCards = [
    {
      label: 'Usuários cadastrados',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconClass: 'text-blue-500',
      isCurrency: false,
    },
    {
      label: 'Usuários ativos (30 dias)',
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      iconClass: 'text-emerald-500',
      isCurrency: false,
    },
    {
      label: 'Créditos disponíveis',
      value: stats?.totalCredits ?? 0,
      icon: Coins,
      iconClass: 'text-purple-500',
      isCurrency: true,
    },
    {
      label: 'Créditos utilizados',
      value: stats?.usedCredits ?? 0,
      icon: TrendingUp,
      iconClass: 'text-amber-500',
      isCurrency: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Administrador</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe métricas de uso, créditos e atividades recentes do ambiente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {metric.isCurrency
                    ? currencyFormatter.format(metric.value)
                    : metric.value.toLocaleString('pt-BR')}
                </p>
              </div>
              <metric.icon className={`h-8 w-8 ${metric.iconClass}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Receita recorrente mensal (MRR)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Evolução mensal da receita recorrente com base nos planos ativos.
            </p>
          </div>
          {stats?.mrrSeries?.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.mrrSeries}>
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => currencyFormatter.format(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => currencyFormatter.format(value)}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      borderRadius: '0.75rem',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há dados de MRR disponíveis.</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Taxa de churn mensal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quantidade de cancelamentos por mês comparado à base ativa.
            </p>
          </div>
          {stats?.churnSeries?.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.churnSeries}>
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      borderRadius: '0.75rem',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum dado de churn registrado nos últimos meses.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="px-0">
          <CardTitle>Atividades recentes</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {stats?.recentActivity?.length ? (
            <ul className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-none"
                >
                  <div>
                    <p className="font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs uppercase text-foreground">
                    {activity.type}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada recentemente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
