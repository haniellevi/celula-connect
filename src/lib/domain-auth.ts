import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PerfilUsuario } from '@/lib/prisma-client'
import { db } from '@/lib/db'
import { getConfiguracaoSistema } from '@/lib/queries/settings'

const E2E_BYPASS = process.env.E2E_AUTH_BYPASS === '1'
const E2E_FALLBACK_USER_ID = process.env.E2E_BYPASS_DOMAIN_USER_ID ?? 'seed-user-pastor'

const domainUserInclude = {
  igreja: true,
  membrosCelula: {
    include: {
      celula: {
        include: {
          igreja: true,
        },
      },
    },
  },
} as const

export type DomainUser = Awaited<ReturnType<typeof getDomainUserByClerkId>>

type RequireDomainUserResult =
  | { user: DomainUser; response: null }
  | { user: null; response: NextResponse }

export async function getDomainUserByClerkId(clerkUserId: string) {
  return db.usuario.findUnique({
    where: { clerkUserId },
    include: domainUserInclude,
  })
}

export async function requireDomainUser(): Promise<RequireDomainUserResult> {
  if (E2E_BYPASS) {
    const fallback =
      (E2E_FALLBACK_USER_ID
        ? await db.usuario.findUnique({
            where: { id: E2E_FALLBACK_USER_ID },
            include: domainUserInclude,
          })
        : null) ??
      (await db.usuario.findFirst({
        include: domainUserInclude,
        orderBy: { createdAt: 'asc' },
      }))

    if (fallback) {
      return { user: fallback, response: null }
    }

    return {
      user: null,
      response: NextResponse.json(
        { error: 'Perfil eclesiástico não encontrado para este usuário' },
        { status: 403 },
      ),
    }
  }

  const { userId } = await auth()
  if (!userId) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
    }
  }

  const domainUser = await getDomainUserByClerkId(userId)
  if (!domainUser) {
    return {
      response: NextResponse.json(
        { error: 'Perfil eclesiástico não encontrado para este usuário' },
        { status: 403 },
      ),
      user: null,
    }
  }

  return { user: domainUser, response: null }
}

export function hasRole(user: DomainUser | null, allowed: PerfilUsuario[]) {
  if (!user) return false
  return allowed.includes(user.perfil)
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Acesso não permitido para este recurso' }, { status: 403 })
}

export async function assertDomainMutationsEnabled() {
  const flag = await getConfiguracaoSistema('ENABLE_DOMAIN_MUTATIONS')
  return flag?.valor !== 'false'
}
