import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-utils";
import { withApiLogging } from "@/lib/logging/api";

const E2E_BYPASS = process.env.E2E_AUTH_BYPASS === '1'
const FALLBACK_CLERK_USER_ID = process.env.E2E_BYPASS_CLERK_USER_ID ?? 'usr_seed_pastor'
const FALLBACK_CLERK_EMAIL = process.env.E2E_BYPASS_CLERK_EMAIL ?? 'pastor.seed@celula-connect.dev'

async function handleAdminVerify() {
  try {
    if (E2E_BYPASS) {
      return NextResponse.json({
        isAdmin: true,
        email: FALLBACK_CLERK_EMAIL,
        userId: FALLBACK_CLERK_USER_ID,
        bypass: true,
      })
    }

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ isAdmin: false }, { status: 401 });

    const user = await currentUser();
    if (!user) return NextResponse.json({ isAdmin: false }, { status: 401 });

    const admin = await isAdmin(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    return NextResponse.json({ isAdmin: admin, email: userEmail, userId });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

export const GET = withApiLogging(handleAdminVerify, {
  method: "GET",
  route: "/api/admin/verify",
  feature: "admin_verify",
})
