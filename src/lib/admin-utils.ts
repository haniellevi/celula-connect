import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];
const E2E_BYPASS = process.env.E2E_AUTH_BYPASS === '1'
const FALLBACK_CLERK_USER_ID = process.env.E2E_BYPASS_CLERK_USER_ID ?? 'usr_seed_pastor'

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    if (E2E_BYPASS) {
      return true
    }

    if (ADMIN_USER_IDS.includes(userId)) return true;

    const user = await currentUser();
    if (!user) return false;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    return ADMIN_EMAILS.includes(userEmail);
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}

interface RequireAdminResult {
  userId: string | null
  response: NextResponse | null
}

export async function requireAdminAccess(): Promise<RequireAdminResult> {
  if (E2E_BYPASS) {
    return { userId: FALLBACK_CLERK_USER_ID, response: null }
  }

  const { userId } = await auth()
  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (!(await isAdmin(userId))) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { userId, response: null }
}
