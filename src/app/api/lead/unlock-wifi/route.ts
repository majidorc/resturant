import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, restaurantId, source } = body;

    if (!email || !restaurantId) {
      return NextResponse.json(
        { error: "Email and Restaurant ID are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        wifiSsid: true,
        wifiPassword: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    await prisma.customerLead.create({
      data: {
        restaurantId,
        email: email.toLowerCase().trim(),
        source: source || "WIFI_UNLOCK",
        emailSent: false,
      },
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
