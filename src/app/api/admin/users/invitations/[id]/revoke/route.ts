import { NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin-utils"
import { withApiLogging } from "@/lib/logging/api"
import { adaptRouteWithParams } from "@/lib/api/params"

export const runtime = 'nodejs'

async function handleAdminInvitationRevoke(
  _req: Request,
  params: { id: string }
) {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response

    const { id } = params
    try {
      // Use Clerk Backend API per docs: POST /v1/invitations/{invitation_id}/revoke
      const token = process.env.CLERK_SECRET_KEY
      if (!token) return NextResponse.json({ error: 'CLERK_SECRET_KEY não configurado' }, { status: 501 })
      const url = `https://api.clerk.com/v1/invitations/${encodeURIComponent(id)}/revoke`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      const text = await res.text()
      if (!res.ok) {
        let msg = text
        try { const j = JSON.parse(text); msg = j?.message || j?.error || text } catch {}
        return NextResponse.json({ error: msg || 'Falha ao revogar' }, { status: res.status })
      }
      return NextResponse.json({ status: 'revoked' })
    } catch (err) {
      const message = (err as { errors?: Array<{ message?: string }>; message?: string; status?: number })?.errors?.[0]?.message || (err as { message?: string })?.message || 'Falha ao revogar convite'
      return NextResponse.json({ error: message }, { status: (err as { status?: number })?.status || 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: (error as { message?: string })?.message || 'Erro inesperado' }, { status: 500 })
  }
}

export const POST = withApiLogging(
  adaptRouteWithParams<{ id: string }>(({ request, params }) =>
    handleAdminInvitationRevoke(request, params),
  ),
  {
    method: "POST",
    route: "/api/admin/users/invitations/[id]/revoke",
    feature: "admin_users",
  },
)
