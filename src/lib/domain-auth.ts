import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PerfilUsuario } from '../../prisma/generated/client'
import { db } from '@/lib/db'

export type DomainUser = Awaited<ReturnType<typeof getDomainUserByClerkId>>

type RequireDomainUserResult =
  | { user: DomainUser; response: null }
  | { user: null; response: NextResponse }

export async function getDomainUserByClerkId(clerkUserId: string) {
  return db.usuario.findUnique({
    where: { clerkUserId },
    include: {
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
    },
  })
}

export async function requireDomainUser(): Promise<RequireDomainUserResult> {
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
