import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, rating, comment } = body;

    if (!restaurantId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "restaurantId and rating (1–5) required." },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    await prisma.feedback.create({
      data: {
        restaurantId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
