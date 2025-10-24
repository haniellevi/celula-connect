import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { OperationType } from "@/lib/prisma-client"
import { syncClerkCreditsMetadata } from "@/lib/clerk/credit-metadata"
import { requireAdminAccess } from "@/lib/admin-utils"
import { withApiLogging } from "@/lib/logging/api"
import { adaptRouteWithParams } from "@/lib/api/params"
import { areCreditsEnabled, logCreditsDisabled } from '@/lib/credits/feature-flag'

async function handleAdminUserCredits(
  request: Request,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response
    const adminUserId = access.userId

    if (!areCreditsEnabled()) {
      logCreditsDisabled({ action: 'admin.userCredits.update', adminUserId, userId: params.id })
      return NextResponse.json({ creditsDisabled: true, message: 'Credits module is currently disabled' }, { status: 200 })
    }

    const body = await request.json().catch(() => ({}))
    const { credits, adjustment } = body as { credits?: number; adjustment?: number }

    const { id } = params
    const creditBalance = await db.creditBalance.findUnique({
      where: { userId: id },
    })

    if (!creditBalance) {
      return NextResponse.json({ error: "Credit balance not found" }, { status: 404 })
    }

    let newBalance: number
    let delta = 0
    if (typeof credits === "number") {
      newBalance = Math.max(0, Math.floor(credits))
      delta = newBalance - creditBalance.creditsRemaining
    } else if (typeof adjustment === "number") {
      delta = Math.floor(adjustment)
      newBalance = Math.max(0, creditBalance.creditsRemaining + delta)
    } else {
      return NextResponse.json({ error: "Provide 'credits' or 'adjustment' number" }, { status: 400 })
    }

    const updated = await db.creditBalance.update({
      where: { id: creditBalance.id },
      data: { creditsRemaining: newBalance, lastSyncedAt: new Date() },
    })

    let metadataSynced = true
    try {
      await syncClerkCreditsMetadata(creditBalance.clerkUserId, updated.creditsRemaining, {
        lastSyncedAt: updated.lastSyncedAt,
      })
    } catch (error) {
      metadataSynced = false
      console.error('Failed to sync Clerk credits metadata for admin user adjustment', error)
    }

    if (delta !== 0) {
      await db.usageHistory.create({
        data: {
          userId: creditBalance.userId,
          creditBalanceId: creditBalance.id,
          // Reuse existing enum, mark as admin adjustment in details
          operationType: OperationType.AI_TEXT_CHAT,
          creditsUsed: Math.abs(delta),
          details: { type: "admin_adjustment", delta, adminId: adminUserId, reason: "Manual set/adjust by admin" },
        },
      })
    }

    return NextResponse.json({ ...updated, metadataSynced })
  } catch (error) {
    console.error("Failed to set/adjust credits:", error)
    return NextResponse.json({ error: "Failed to set/adjust credits" }, { status: 500 })
  }
}

export const PUT = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) =>
    handleAdminUserCredits(request, params),
  ),
  {
    method: "PUT",
    route: "/api/admin/users/[id]/credits",
    feature: "admin_users",
  },
)
