import { db } from '@/lib/db'
import { FEATURE_CREDIT_COSTS, FeatureKey } from '@/lib/credits/feature-config'
import { areCreditsEnabled, logCreditsDisabled } from '@/lib/credits/feature-flag'

export type AdminSettingsPayload = {
  featureCosts?: Partial<Record<FeatureKey, number>>
}

export async function getRawAdminSettings() {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getRawAdminSettings' })
    return null
  }

  try {
    const row = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
    return row || null
  } catch (e) {
    console.error('getRawAdminSettings error', e)
    return null
  }
}

export async function getEffectiveFeatureCosts(): Promise<Record<FeatureKey, number>> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getEffectiveFeatureCosts' })
    const zeroed = {} as Record<FeatureKey, number>
    for (const key of Object.keys(FEATURE_CREDIT_COSTS) as FeatureKey[]) {
      zeroed[key] = 0
    }
    return zeroed
  }

  const row = await getRawAdminSettings()
  const overrides = (row?.featureCosts || {}) as Partial<Record<FeatureKey, number>>
  const merged: Record<FeatureKey, number> = { ...FEATURE_CREDIT_COSTS }
  for (const key of Object.keys(FEATURE_CREDIT_COSTS) as FeatureKey[]) {
    const v = overrides[key]
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) merged[key] = Math.floor(v)
  }
  return merged
}

export async function getFeatureCost(feature: FeatureKey): Promise<number> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getFeatureCost', feature })
    return 0
  }

  const costs = await getEffectiveFeatureCosts()
  return costs[feature]
}

export async function getEffectivePlanCredits(): Promise<Record<string, number>> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getEffectivePlanCredits' })
    return {}
  }

  const plans = await db.plan.findMany({ where: { active: true } })
  const out: Record<string, number> = {}
  for (const p of plans) {
    if (!p.clerkId) continue
    out[p.clerkId] = Math.max(0, Math.floor(p.credits))
  }
  return out
}

export async function getPlanCredits(planId: string): Promise<number> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getPlanCredits', planId })
    return 0
  }

  const plan = await db.plan.findUnique({ where: { clerkId: planId } })
  return plan ? Math.max(0, Math.floor(plan.credits)) : 0
}

export type PlanOption = { id: string; label: string }

export async function getPlanOptions(): Promise<PlanOption[]> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getPlanOptions' })
    return []
  }

  const plans = await db.plan.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } })
  return plans
    .filter((p) => p.clerkId)
    .map(p => ({ id: p.clerkId!, label: `${p.name || p.clerkId} — ${p.clerkId}` }))
}

export async function getBasePlanCredits(): Promise<Record<string, number>> {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'getBasePlanCredits' })
    return {}
  }

  const plans = await db.plan.findMany({ where: { active: true } })
  const base: Record<string, number> = {}
  for (const p of plans) {
    if (!p.clerkId) continue
    base[p.clerkId] = Math.max(0, Math.floor(p.credits))
  }
  return base
}

export async function upsertAdminSettings(updates: AdminSettingsPayload) {
  // Clean values
  const clean: AdminSettingsPayload = {}
  if (updates.featureCosts) {
    clean.featureCosts = {}
    for (const [k, v] of Object.entries(updates.featureCosts)) {
      const key = k as FeatureKey
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        clean.featureCosts[key] = Math.floor(v)
      }
    }
  }
  // All plan data managed via Plan model; no legacy plan fields here

  const row = await db.adminSettings.upsert({
    where: { id: 'singleton' },
    update: { ...clean },
    create: { id: 'singleton', ...clean },
  })
  return row
}
