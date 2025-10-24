import { NextResponse } from 'next/server'
import { getEffectiveFeatureCosts, getEffectivePlanCredits } from '@/lib/credits/settings'
import { withApiLogging } from '@/lib/logging/api'
import { areCreditsEnabled, logCreditsDisabled } from '@/lib/credits/feature-flag'

async function handleGetSettings() {
  if (!areCreditsEnabled()) {
    logCreditsDisabled({ action: 'api.credits.settings' })
    return NextResponse.json({ featureCosts: {}, planCredits: null, creditsEnabled: false })
  }

  const featureCosts = await getEffectiveFeatureCosts()
  const planCredits = await getEffectivePlanCredits()
  return NextResponse.json({ featureCosts, planCredits, creditsEnabled: true })
}

export const GET = withApiLogging(handleGetSettings, {
  method: 'GET',
  route: '/api/credits/settings',
  feature: 'credits',
})
