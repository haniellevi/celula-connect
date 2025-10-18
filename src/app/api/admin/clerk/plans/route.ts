import { NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-utils'
import { fetchCommercePlans } from '@/lib/clerk/commerce-plans'
import { withApiLogging } from '@/lib/logging/api'

async function handleAdminClerkPlans() {
  const access = await requireAdminAccess()
  if (access.response) return access.response

  try {
    const plans = await fetchCommercePlans()
    return NextResponse.json({ plans })
  } catch (error) {
    const message = (error as Error)?.message || 'Falha ao obter planos do Clerk'
    const lower = message.toLowerCase()
    const status = lower.includes('not configured') || lower.includes('não configurado') ? 501 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export const GET = withApiLogging(handleAdminClerkPlans, {
  method: 'GET',
  route: '/api/admin/clerk/plans',
  feature: 'admin_plans',
})
