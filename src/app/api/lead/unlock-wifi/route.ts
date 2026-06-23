import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, restaurantId } = body;

    if (!email || !restaurantId) {
      return NextResponse.json(
        { error: "Email and Restaurant ID are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        wifiSsid: true,
        wifiPassword: true,
        isActive: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    if (!restaurant.isActive) {
      return NextResponse.json({ error: "This restaurant is currently unavailable." }, { status: 403 });
    }

    await prisma.customerLead.upsert({
      where: {
        restaurantId_email: {
          restaurantId,
          email: normalizedEmail,
        },
      },
      create: {
        restaurantId,
        email: normalizedEmail,
        source: "WIFI_UNLOCK",
        emailSent: false,
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      ssid: restaurant.wifiSsid || "No Public Wi-Fi",
      password: restaurant.wifiPassword || "",
    });
  } catch (error) {
    console.error("Error unlocking Wi-Fi:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
