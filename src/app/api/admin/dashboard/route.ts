import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAccess } from '@/lib/admin-utils'
import { withApiLogging } from '@/lib/logging/api'

interface DashboardMetricPoint {
  label: string
  value: number
}

function buildMonthlyBuckets(monthsBack: number): { label: string; start: Date; end: Date }[] {
  const buckets: { label: string; start: Date; end: Date }[] = []
  const now = new Date()
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    buckets.push({
      label: start.toLocaleString('default', { month: 'short' }),
      start,
      end,
    })
  }
  return buckets
}

async function handleAdminDashboard() {
  const access = await requireAdminAccess()
  if (access.response) return access.response

  try {
    const now = new Date()
    const last30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    const buckets = buildMonthlyBuckets(6)

    const [totalUsuarios, totalCelulas, totalAvisos, totalDevocionais, leiturasRecentes, metasEmAndamento] =
      await Promise.all([
        db.usuario.count(),
        db.celula.count(),
        db.aviso.count({ where: { ativo: true } }),
        db.devocional.count({ where: { ativo: true } }),
        db.leituraRegistro.findMany({
          where: { dataLeitura: { gte: last30Days } },
          select: { dataLeitura: true },
        }),
        db.metaLeituraUsuario.count({ where: { ativa: true } }),
      ])

    const leiturasPorMes: DashboardMetricPoint[] = []
    for (const bucket of buckets) {
      const count = await db.leituraRegistro.count({
        where: {
          dataLeitura: {
            gte: bucket.start,
            lte: bucket.end,
          },
        },
      })
      leiturasPorMes.push({ label: bucket.label, value: count })
    }

    const avisosUrgentesTotal = await db.aviso.count({
      where: {
        prioridade: 'URGENTE',
        ativo: true,
        dataInicio: { lte: now },
        OR: [{ dataFim: null }, { dataFim: { gte: now } }],
      },
    })

    const metasConcluidasNoMes = await Promise.all(
      buckets.map(async (bucket) => {
        const count = await db.metaLeituraUsuario.count({
          where: {
            concluido: true,
            updatedAt: {
              gte: bucket.start,
              lte: bucket.end,
            },
          },
        })
        return { label: bucket.label, value: count }
      }),
    )

    const leiturasPorDia = leiturasRecentes.reduce<Map<string, number>>((acc, leitura) => {
      const key = leitura.dataLeitura.toISOString().slice(0, 10)
      acc.set(key, (acc.get(key) ?? 0) + 1)
      return acc
    }, new Map())

    const activity = Array.from(leiturasPorDia.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 10)
      .map(([date, value]) => ({ label: date, value }))

    return NextResponse.json({
      totalUsuarios,
      totalCelulas,
      metasAtivas: metasEmAndamento,
      avisosAtivos: totalAvisos,
      devocionaisAtivos: totalDevocionais,
      avisosUrgentes: avisosUrgentesTotal,
      leiturasPorMes,
      metasConcluidasNoMes,
      activity,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}

export const GET = withApiLogging(handleAdminDashboard, {
  method: 'GET',
  route: '/api/admin/dashboard',
  feature: 'admin_dashboard',
})
