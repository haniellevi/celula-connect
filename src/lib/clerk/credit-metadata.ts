import { clerkClient } from '@clerk/nextjs/server'

type UnknownRecord = Record<string, unknown>

export interface SyncClerkCreditsOptions {
  creditsTotal?: number
  planId?: string
  lastSyncedAt?: Date
}

export async function syncClerkCreditsMetadata(
  clerkUserId: string,
  creditsRemaining: number,
  options: SyncClerkCreditsOptions = {},
): Promise<UnknownRecord> {
  const safeCredits = Math.max(0, Math.floor(creditsRemaining))
  const client = clerkClient

  try {
    const user = await client.users.getUser(clerkUserId)
    const currentMetadata = (user.publicMetadata ?? {}) as UnknownRecord

    const resolvedCreditsTotal =
      options.creditsTotal !== undefined && Number.isFinite(options.creditsTotal)
        ? Math.max(0, Math.floor(options.creditsTotal))
        : typeof currentMetadata.creditsTotal === 'number'
          ? Math.max(0, Math.floor(currentMetadata.creditsTotal as number))
          : safeCredits

    const syncMoment = options.lastSyncedAt ?? new Date()
    const updatedMetadata: UnknownRecord = {
      ...currentMetadata,
      creditsRemaining: safeCredits,
      creditsTotal: resolvedCreditsTotal,
      lastCreditsSyncAt: syncMoment.toISOString(),
    }

    if (options.planId) {
      updatedMetadata.subscriptionPlan = options.planId
    }

    await client.users.updateUser(clerkUserId, {
      publicMetadata: updatedMetadata,
    })

    return updatedMetadata
  } catch (error) {
    console.error('syncClerkCreditsMetadata: failed to update Clerk metadata', {
      clerkUserId,
      error,
    })
    throw error
  }
}
