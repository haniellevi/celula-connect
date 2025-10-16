"use client";

import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Activity, Megaphone, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { useDashboard } from "@/hooks/use-dashboard";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <p className="text-sm text-destructive mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Administrador</h1>
          <p className="text-muted-foreground mt-2">Visão geral do engajamento, comunicação e saúde das células.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Leituras registradas (6 meses)
          </span>
          <span className="inline-flex items-center gap-1">
            <Megaphone className="h-4 w-4 text-amber-500" /> Avisos urgentes ativos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Usuários cadastrados</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.totalUsuarios ?? 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Células cadastradas</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.totalCelulas ?? 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Metas de leitura em andamento</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.metasAtivas ?? 0}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Avisos urgentes</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.avisosUrgentes ?? 0}
              </p>
            </div>
            <Megaphone className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Leituras registradas</h2>
              <p className="text-sm text-muted-foreground">Total de capítulos lidos por mês (últimos 6 meses).</p>
            </div>
          </div>
          {stats?.leiturasPorMes?.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.leiturasPorMes}>
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                    contentStyle={{ background: 'hsl(var(--background))', borderRadius: '0.75rem', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem leituras registradas no período analisado.</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Metas concluídas</h2>
              <p className="text-sm text-muted-foreground">Quantidade de metas de leitura concluídas por mês.</p>
            </div>
          </div>
          {stats?.metasConcluidasNoMes?.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.metasConcluidasNoMes}>
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, opacity: 0.3 }}
                    contentStyle={{ background: 'hsl(var(--background))', borderRadius: '0.75rem', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma meta concluída no período monitorado.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

// Removed seed/backfill demo buttons to simplificar a surface administrativa
