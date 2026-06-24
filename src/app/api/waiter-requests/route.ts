import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredRestaurantId } from "@/lib/session";

export async function GET() {
  try {
    const { restaurantId } = await getRequiredRestaurantId();

    const pendingRequests = await prisma.tableServiceRequest.findMany({
      where: { restaurantId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tableNumber: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      requests: pendingRequests.map((request) => ({
        ...request,
        createdAt: request.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
