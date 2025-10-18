import { NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-utils'
import { toPrismaOperationType } from '@/lib/credits/feature-config'
import { OperationType } from '@/lib/prisma-types'
import { withApiLogging } from '@/lib/logging/api'

export const runtime = 'nodejs'

async function handleCreditsEnumHealth() {
  const access = await requireAdminAccess()
  if (access.response) return access.response

  try {
    // Validate enum mapping and presence
    const chat = toPrismaOperationType('ai_text_chat')
    const image = toPrismaOperationType('ai_image_generation')

    const ok = chat === OperationType.AI_TEXT_CHAT && image === OperationType.AI_IMAGE_GENERATION

    return NextResponse.json({
      ok,
      mappings: {
        ai_text_chat: String(chat),
        ai_image_generation: String(image),
      },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error)?.message || 'Failed' }, { status: 500 })
  }
}

export const GET = withApiLogging(handleCreditsEnumHealth, {
  method: 'GET',
  route: '/api/admin/health/credits-enum',
  feature: 'admin_health',
})
