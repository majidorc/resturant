import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUEST_TYPES = new Set(["CALL_WAITER", "REQUEST_BILL"]);

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const restaurantId =
      typeof body === "object" && body && "restaurantId" in body
        ? String(body.restaurantId).trim()
        : "";
    const tableNumber =
      typeof body === "object" && body && "tableNumber" in body
        ? String(body.tableNumber).trim()
        : "";
    const type =
      typeof body === "object" && body && "type" in body ? String(body.type).trim() : "";

    if (!restaurantId || !tableNumber || !REQUEST_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    if (tableNumber.length > 32) {
      return NextResponse.json({ error: "Table number is too long." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, isActive: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    if (!restaurant.isActive) {
      return NextResponse.json({ error: "Restaurant is not active." }, { status: 403 });
    }

    await prisma.tableServiceRequest.create({
      data: {
        restaurantId,
        tableNumber,
        type: type as "CALL_WAITER" | "REQUEST_BILL",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving table service request:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
