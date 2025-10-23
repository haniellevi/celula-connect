import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminAccess } from "@/lib/admin-utils"
import { withApiLogging } from "@/lib/logging/api"
import { adaptRouteWithParams } from "@/lib/api/params"

async function handleAdminUserActivate(
  _request: Request,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response

    const { id } = params
    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await db.user.update({ where: { id }, data: { isActive: true } })
    return NextResponse.json({ success: true, user: { id: updated.id, isActive: updated.isActive } })
  } catch (error) {
    console.error('Failed to activate user:', error)
    return NextResponse.json({ error: 'Failed to activate user' }, { status: 500 })
  }
}

export const POST = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) =>
    handleAdminUserActivate(request, params),
  ),
  {
    method: "POST",
    route: "/api/admin/users/[id]/activate",
    feature: "admin_users",
  },
)
