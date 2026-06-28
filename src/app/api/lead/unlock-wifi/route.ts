import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plan";
import { countLeadsThisMonth, getRestaurantPlanAccessById } from "@/lib/plan-server";

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
        plan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    if (!restaurant.isActive) {
      return NextResponse.json({ error: "This restaurant is currently unavailable." }, { status: 403 });
    }

    const planAccess = await getRestaurantPlanAccessById(restaurantId);

    if (planAccess?.isFreeTier) {
      const existingLead = await prisma.customerLead.findUnique({
        where: {
          restaurantId_email: {
            restaurantId,
            email: normalizedEmail,
          },
        },
      });

      if (!existingLead) {
        const leadsThisMonth = await countLeadsThisMonth(restaurantId);
        if (leadsThisMonth >= PLAN_LIMITS.freeMaxLeadsPerMonth) {
          return NextResponse.json(
            {
              error: `This restaurant has reached the Free plan limit of ${PLAN_LIMITS.freeMaxLeadsPerMonth} leads this month.`,
            },
            { status: 403 },
          );
        }
      }
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
