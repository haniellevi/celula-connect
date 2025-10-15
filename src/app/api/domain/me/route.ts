import { NextResponse } from 'next/server'
import { withApiLogging } from '@/lib/logging/api'
import { requireDomainUser } from '@/lib/domain-auth'

async function handleGet() {
  const authResult = await requireDomainUser()
  if (!authResult.user) {
    return authResult.response ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data: authResult.user })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/domain/me',
  feature: 'domain_profile',
})
