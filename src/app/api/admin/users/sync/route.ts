import { createClerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin-utils"
import { db } from "@/lib/db"
import { refreshUserCredits } from "@/lib/credits/validate-credits"
import { withApiLogging } from "@/lib/logging/api"

interface ClerkEmailAddress {
  id?: string | null
  emailAddress?: string | null
}

interface ClerkUserSummary {
  id: string
  emailAddresses?: ClerkEmailAddress[]
  email_addresses?: ClerkEmailAddress[]
  primaryEmailAddressId?: string | null
  primary_email_address_id?: string | null
  firstName?: string | null
  first_name?: string | null
  lastName?: string | null
  last_name?: string | null
}

interface ClerkSubscriptionItem {
  plan_id?: string | null
  plan?: {
    id?: string | null
  } | null
}

interface ClerkSubscriptionData {
  status?: string | null
  plan_id?: string | null
  plan?: {
    id?: string | null
  } | null
  subscription_items?: ClerkSubscriptionItem[] | null
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isClerkEmailAddress = (value: unknown): value is ClerkEmailAddress => {
  if (!isPlainObject(value)) return false
  if (value.id !== undefined && value.id !== null && typeof value.id !== 'string') return false
  if (value.emailAddress !== undefined && value.emailAddress !== null && typeof value.emailAddress !== 'string') {
    return false
  }
  return true
}

const isClerkUserSummary = (value: unknown): value is ClerkUserSummary => {
  if (!isPlainObject(value)) return false
  if (typeof value.id !== 'string') return false

  const emailAddresses =
    value.emailAddresses ??
    (Object.prototype.hasOwnProperty.call(value, 'email_addresses') ? value.email_addresses : undefined)
  if (emailAddresses !== undefined) {
    if (!Array.isArray(emailAddresses) || !emailAddresses.every(isClerkEmailAddress)) {
      return false
    }
  }

  const primaryEmail =
    value.primaryEmailAddressId ??
    (Object.prototype.hasOwnProperty.call(value, 'primary_email_address_id')
      ? value.primary_email_address_id
      : undefined)
  if (primaryEmail !== undefined && primaryEmail !== null && typeof primaryEmail !== 'string') {
    return false
  }

  const firstName = value.firstName ?? value.first_name
  if (firstName !== undefined && firstName !== null && typeof firstName !== 'string') return false
  const lastName = value.lastName ?? value.last_name
  if (lastName !== undefined && lastName !== null && typeof lastName !== 'string') return false

  return true
}

const isClerkSubscriptionItem = (value: unknown): value is ClerkSubscriptionItem => {
  if (!isPlainObject(value)) return false
  if (value.plan_id !== undefined && value.plan_id !== null && typeof value.plan_id !== 'string') return false
  if (value.plan !== undefined && value.plan !== null) {
    if (!isPlainObject(value.plan)) return false
    if (value.plan.id !== undefined && value.plan.id !== null && typeof value.plan.id !== 'string') return false
  }
  return true
}

const isClerkSubscriptionData = (value: unknown): value is ClerkSubscriptionData => {
  if (!isPlainObject(value)) return false
  if (value.status !== undefined && value.status !== null && typeof value.status !== 'string') return false
  if (value.plan_id !== undefined && value.plan_id !== null && typeof value.plan_id !== 'string') return false
  if (value.plan !== undefined && value.plan !== null) {
    if (!isPlainObject(value.plan)) return false
    if (value.plan.id !== undefined && value.plan.id !== null && typeof value.plan.id !== 'string') return false
  }
  if (value.subscription_items !== undefined && value.subscription_items !== null) {
    if (!Array.isArray(value.subscription_items) || !value.subscription_items.every(isClerkSubscriptionItem)) {
      return false
    }
  }
  return true
}

const extractSubscriptionData = (value: unknown): ClerkSubscriptionData | null => {
  if (isClerkSubscriptionData(value)) return value
  if (isPlainObject(value) && 'data' in value) {
    const nested = (value as { data?: unknown }).data
    if (isClerkSubscriptionData(nested)) {
      return nested
    }
  }
  return null
}

const extractPlanIdFromSubscription = (subscription: ClerkSubscriptionData): string | null => {
  const directPlan = subscription.plan_id ?? subscription.plan?.id ?? null
  if (directPlan) return directPlan
  const items = subscription.subscription_items ?? []
  for (const item of items) {
    if (item.plan_id) return item.plan_id
    if (item.plan?.id) return item.plan.id
  }
  return null
}

const readNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const readBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes'].includes(normalized)) return true
    if (['false', '0', 'no'].includes(normalized)) return false
  }
  return null
}

const extractFirstErrorMessage = (value: unknown): string | null => {
  if (isPlainObject(value)) {
    if (Array.isArray(value.errors)) {
      const [first] = value.errors
      if (isPlainObject(first) && typeof first.message === 'string') {
        return first.message
      }
    }
    if (typeof value.message === 'string') {
      return value.message
    }
  }
  if (value instanceof Error) {
    return value.message
  }
  return null
}

const extractErrorStatus = (value: unknown): number | null => {
  if (isPlainObject(value) && typeof value.status === 'number' && Number.isFinite(value.status)) {
    return value.status
  }
  return null
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string })
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

async function handleAdminUsersSync(request: Request) {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response

    const rawBody = await request.json().catch(() => null) as unknown
    const body = isPlainObject(rawBody) ? rawBody : {}

    const pageSizeInput = readNumber(body.pageSize)
    const maxPagesInput = readNumber(body.maxPages)
    const debugInput = readBoolean(body.debug)
    const syncUsersInput = readBoolean(body.syncUsers)
    const syncPlansInput = readBoolean(body.syncPlans)
    const setCreditsInput = readBoolean(body.setCredits)
    const overrideCreditsInput = readNumber(body.overrideCredits)

    const pageSize = Math.max(1, Math.min(200, pageSizeInput ?? 50))
    const max = Math.max(1, Math.min(20, maxPagesInput ?? 10))
    const debug = (debugInput ?? false) || process.env.DEBUG_CLERK_SYNC === '1'
    const syncUsers = syncUsersInput ?? true
    const syncPlans = syncPlansInput ?? true
    const setCredits = setCreditsInput ?? true
    const overrideAmount = overrideCreditsInput != null ? Math.max(0, Math.floor(overrideCreditsInput)) : null

    const dlog = (...args: unknown[]) => { if (debug) console.log('[admin/users/sync]', ...args) }

    let totalProcessed = 0
    let createdUsers = 0
    let createdBalances = 0
    let activeSubscriptions = 0
    let creditsRefreshed = 0
    let pagesProcessed = 0
    const unmappedPlanIds = new Set<string>()

    const billingToken = process.env.CLERK_SECRET_KEY
    const canQueryBilling = Boolean(billingToken)

    // Canonical Clerk Billing endpoint: https://api.clerk.com/v1/users/{user_id}/billing/subscription
    async function fetchActivePlanIdForUser(userClerkId: string, headers: Record<string, string>): Promise<string | null> {
      const url = `https://api.clerk.com/v1/users/${encodeURIComponent(userClerkId)}/billing/subscription`
    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' })
    if (!res.ok) {
      console.warn('[admin/users/sync] billing/subscription request failed', { userClerkId, status: res.status })
      return null
    }
    const text = await res.text()
    let data: unknown = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    const subscription = extractSubscriptionData(data)
    console.log('[admin/users/sync] billing/subscription request succeeded', {
      userClerkId,
      status: res.status,
      data: subscription ?? data,
    })
    if (!subscription) return null
    const status = typeof subscription.status === 'string' ? subscription.status.toLowerCase() : ''
    if (status !== 'active') return null
    return extractPlanIdFromSubscription(subscription)
  }

    for (let page = 0; page < max; page++) {
      const response = await clerk.users.getUserList({ limit: pageSize, offset: page * pageSize }) as unknown
      const candidateList = Array.isArray((response as { data?: unknown[] })?.data)
        ? ((response as { data: unknown[] }).data)
        : Array.isArray(response)
          ? (response as unknown[])
          : []
      const users = candidateList.filter(isClerkUserSummary)
      if (users.length === 0) break
      pagesProcessed++
      dlog(`page ${page + 1}/${max}: fetched ${users.length} users`)

      // Process users in batches to prevent database connection exhaustion
      const BATCH_SIZE = 10
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (cu) => {
          totalProcessed++
          try {
            const clerkId = cu.id
            dlog('processing user', { clerkId })
            const emailAddresses = cu.emailAddresses ?? cu.email_addresses ?? []
            const primaryEmailId = cu.primaryEmailAddressId ?? cu.primary_email_address_id ?? null
            const primary =
              (primaryEmailId
                ? emailAddresses.find((e) => e.id === primaryEmailId)
                : undefined) ?? emailAddresses[0]
            const email = primary?.emailAddress ?? null
            const firstName = cu.firstName ?? cu.first_name ?? null
            const lastName = cu.lastName ?? cu.last_name ?? null
            const nameParts = [firstName, lastName].filter(
              (part): part is string => typeof part === 'string' && part.trim().length > 0,
            )
            const fallbackName =
              (typeof firstName === 'string' && firstName.trim().length > 0 ? firstName : null) ??
              (typeof lastName === 'string' && lastName.trim().length > 0 ? lastName : null) ??
              null
            const name = nameParts.join(' ') || fallbackName

            let dbUser = await db.user.findUnique({ where: { clerkId } })
            if (syncUsers) {
              if (!dbUser) {
                dbUser = await db.user.create({ data: { clerkId, email, name } })
                createdUsers++
              } else {
                await db.user.update({ where: { id: dbUser.id }, data: { email, name } })
              }
              if (dbUser) {
                const balance = await db.creditBalance.findUnique({ where: { userId: dbUser.id } })
                if (!balance) {
                  await db.creditBalance.create({
                    data: {
                      userId: dbUser.id,
                      clerkUserId: clerkId,
                      creditsRemaining: 0,
                    },
                  })
                  createdBalances++
                  dlog('created credit balance', { clerkId, userId: dbUser.id })
                }
              }
            }

            // Attempt to detect an active subscription for this user and refresh credits accordingly
            if (syncPlans && canQueryBilling) {
              try {
                const headers: Record<string, string> = {
                  Authorization: `Bearer ${billingToken}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                }
                const planId = await fetchActivePlanIdForUser(clerkId, headers)
                dlog('subscription lookup', { clerkId, planId })
                if (planId) {
                  const plan = await db.plan.findUnique({ where: { clerkId: planId } })
                  if (plan) {
                    activeSubscriptions++
                    if (setCredits) {
                      const credits = overrideAmount != null ? overrideAmount : Math.max(0, Math.floor(plan.credits))
                      await refreshUserCredits(clerkId, credits, {
                        creditsTotal: credits,
                        planId: plan.clerkId ?? undefined,
                      })
                      creditsRefreshed++
                      dlog('refreshed credits', { clerkId, planId, credits, override: overrideAmount != null })
                    } else {
                      dlog('setCredits disabled; skipping credit update', { clerkId, planId })
                    }
                  } else {
                    unmappedPlanIds.add(planId)
                    dlog('plan not mapped in DB; skipping refresh', { clerkId, planId })
                  }
                } else {
                  dlog('no active subscription found', { clerkId })
                }
              } catch (subErr) {
                // Non-fatal; continue with next user
                console.error('Failed to sync subscription for user', clerkId, subErr)
              }
            }
          } catch (innerErr) {
            console.error('Sync user failed:', innerErr)
          }
        })

        // Wait for batch to complete before processing next batch
        await Promise.allSettled(batchPromises)
      }
    }

    const payload: Record<string, unknown> = {
      processed: totalProcessed,
      createdUsers,
      createdBalances,
      activeSubscriptions,
      creditsRefreshed,
    }
    if (debug) {
      payload.debug = {
        pagesProcessed,
        unmappedPlanIds: Array.from(unmappedPlanIds),
      }
    }
    return NextResponse.json(payload)
  } catch (error: unknown) {
    console.error('Sync from Clerk failed:', error)
    const message = extractFirstErrorMessage(error) ?? 'Failed to sync users'
    const status = extractErrorStatus(error) ?? 500
    return NextResponse.json({ error: message }, { status })
  }
}

export const POST = withApiLogging(handleAdminUsersSync, {
  method: "POST",
  route: "/api/admin/users/sync",
  feature: "admin_users",
})
