import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getUserFromClerkId } from '@/lib/auth-utils';
import { withApiLogging } from '@/lib/logging/api';

const E2E_BYPASS = process.env.E2E_AUTH_BYPASS === '1'
const FALLBACK_USER_ID = process.env.E2E_BYPASS_DOMAIN_USER_ID ?? 'seed-user-pastor'

async function handleGetCredits() {
  try {
    if (E2E_BYPASS) {
      const balance = await db.creditBalance.findUnique({ where: { userId: FALLBACK_USER_ID } })
      if (!balance) {
        return NextResponse.json({ creditsRemaining: 0, lastSyncedAt: null, bypass: true })
      }
      return NextResponse.json({
        creditsRemaining: balance.creditsRemaining,
        lastSyncedAt: balance.lastSyncedAt,
        bypass: true,
      })
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromClerkId(userId);
    const balance = await db.creditBalance.findUnique({ where: { userId: user.id } });

    if (!balance) {
      return NextResponse.json({ creditsRemaining: 0, lastSyncedAt: null });
    }

    return NextResponse.json({
      creditsRemaining: balance.creditsRemaining,
      lastSyncedAt: balance.lastSyncedAt,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetCredits, {
  method: 'GET',
  route: '/api/credits/me',
  feature: 'credits',
});
