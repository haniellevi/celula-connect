import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OperationType } from "@/lib/prisma-types";
import { syncClerkCreditsMetadata } from "@/lib/clerk/credit-metadata";
import { requireAdminAccess } from "@/lib/admin-utils";
import { withApiLogging } from "@/lib/logging/api";
import { adaptRouteWithParams } from "@/lib/api/params";

async function handleAdminCreditUpdate(request: Request, id: string) {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response;
    const adminUserId = access.userId;

    const { adjustment } = await request.json();

    if (typeof adjustment !== "number") {
      return NextResponse.json(
        { error: "Invalid adjustment amount" },
        { status: 400 }
      );
    }

    const creditBalance = await db.creditBalance.findUnique({
      where: { id },
    });

    if (!creditBalance) {
      return NextResponse.json(
        { error: "Credit balance not found" },
        { status: 404 }
      );
    }

    const newBalance = Math.max(0, creditBalance.creditsRemaining + adjustment);

    const updated = await db.creditBalance.update({
      where: { id },
      data: {
        creditsRemaining: newBalance,
        lastSyncedAt: new Date(),
      },
    });

    let metadataSynced = true
    try {
      await syncClerkCreditsMetadata(creditBalance.clerkUserId, updated.creditsRemaining, {
        lastSyncedAt: updated.lastSyncedAt,
      })
    } catch (error) {
      metadataSynced = false
      console.error('Failed to sync Clerk credits metadata for admin adjustment', error)
    }

    if (adjustment !== 0) {
      await db.usageHistory.create({
        data: {
          userId: creditBalance.userId,
          creditBalanceId: creditBalance.id,
          operationType: OperationType.AI_TEXT_CHAT,
          creditsUsed: Math.abs(adjustment),
          details: {
            type: "admin_adjustment",
            adjustment,
            adminId: adminUserId,
            reason: "Manual adjustment by admin",
          },
        },
      });
    }

    return NextResponse.json({ ...updated, metadataSynced });
  } catch (error) {
    console.error("Failed to adjust credits:", error);
    return NextResponse.json(
      { error: "Failed to adjust credits" },
      { status: 500 }
    );
  }
}

export const PUT = withApiLogging(
  adaptRouteWithParams<{ id: string }>(async ({ request, params }) =>
    handleAdminCreditUpdate(request, params.id)
  ),
  {
    method: "PUT",
    route: "/api/admin/credits/[id]",
    feature: "admin_credits",
  }
)
