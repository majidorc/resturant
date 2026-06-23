import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_COMMENT_LENGTH = 2000;

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

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.` },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, isActive: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    if (!restaurant.isActive) {
      return NextResponse.json({ error: "This restaurant is not accepting feedback." }, { status: 403 });
    }

    await prisma.feedback.create({
      data: {
        restaurantId,
        rating,
        comment: trimmedComment || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
