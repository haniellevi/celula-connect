import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminAccess } from "@/lib/admin-utils"
// Nota: evite usar o namespace Prisma diretamente aqui —
// com isolatedModules o acesso `Prisma.*` pode causar conflitos.
// Usamos a assinatura do client para obter o tipo de `where` abaixo.
import { withApiLogging } from "@/lib/logging/api"
import { areCreditsEnabled, logCreditsDisabled } from '@/lib/credits/feature-flag'

async function handleAdminCreditsGet(request: Request): Promise<NextResponse> {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response

    if (!areCreditsEnabled()) {
      logCreditsDisabled({ action: 'admin.credits.list' })
      return NextResponse.json({
        creditBalances: [],
        pagination: {
          page: 1,
          pageSize: 0,
          total: 0,
          pages: 0,
        },
        creditsDisabled: true,
      })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 50)))
    const search = searchParams.get("search")?.trim() || ""
    const includeUsageCount = searchParams.get("includeUsageCount") === "true"
    const minCredits = searchParams.get("minCredits") ? Number(searchParams.get("minCredits")) : undefined
    const maxCredits = searchParams.get("maxCredits") ? Number(searchParams.get("maxCredits")) : undefined

    const whereClause: Parameters<typeof db.creditBalance.findMany>[0]['where'] = {}

    if (search) {
      whereClause.user = {
        is: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      }
    }

    if (minCredits !== undefined || maxCredits !== undefined) {
      whereClause.creditsRemaining = {
        ...(minCredits !== undefined ? { gte: minCredits } : {}),
        ...(maxCredits !== undefined ? { lte: maxCredits } : {})
      }
    }

    const [total, creditBalances] = await Promise.all([
      db.creditBalance.count({ where: whereClause }),
      db.creditBalance.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ...(includeUsageCount
            ? {
                _count: {
                  select: {
                    usageHistory: true
                  }
                }
              }
            : {})
        },
        orderBy: {
          creditsRemaining: "asc"
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])

    return NextResponse.json({
      creditBalances,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error("Failed to fetch credit balances:", error)
    return NextResponse.json(
      { error: "Failed to fetch credit balances" },
      { status: 500 }
    )
  }
}

export const GET = withApiLogging(handleAdminCreditsGet, {
  method: "GET",
  route: "/api/admin/credits",
  feature: "admin_credits",
})
