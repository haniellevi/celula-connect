import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/admin-utils";
import { OperationType } from "@/lib/prisma-types";
import type { Prisma } from "@/lib/prisma-client";
import { withApiLogging } from "@/lib/logging/api";

async function handleAdminUsageGet(request: Request) {
  try {
    const access = await requireAdminAccess()
    if (access.response) return access.response;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const range = searchParams.get("range") || "7days";
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)));

    const filters: Prisma.UsageHistoryWhereInput[] = [];
    if (type !== "all") {
      filters.push({ operationType: type as OperationType });
    }

    if (range !== "all") {
      const now = new Date();
      const startDate = new Date();
      switch (range) {
        case "24hours":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
      }
      filters.push({ timestamp: { gte: startDate } });
    }

    if (q) {
      filters.push({
        user: {
          is: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      });
    }

    const whereClause: Prisma.UsageHistoryWhereInput = filters.length ? { AND: filters } : {};

    const [total, usageHistory] = await Promise.all([
      db.usageHistory.count({ where: whereClause }),
      db.usageHistory.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({ data: usageHistory, total, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch usage history:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage history" },
      { status: 500 }
    );
  }
}

export const GET = withApiLogging(handleAdminUsageGet, {
  method: "GET",
  route: "/api/admin/usage",
  feature: "admin_usage",
})
