import { NextResponse } from "next/server";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getStripe, getStripeProPriceId } from "@/lib/stripe";

export async function POST() {
  try {
    const { session, restaurantId } = await getRequiredRestaurantId();

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    if (restaurant.plan === "PRO" && restaurant.subscriptionStatus === "active") {
      return NextResponse.json({ error: "You already have an active Pro subscription." }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    let customerId = restaurant.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: restaurant.name,
        metadata: {
          restaurantId: restaurant.id,
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: getStripeProPriceId(),
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/settings?billing=success`,
      cancel_url: `${baseUrl}/dashboard/settings?billing=cancelled`,
      client_reference_id: restaurant.id,
      metadata: {
        restaurantId: restaurant.id,
        userId: session.user.id,
      },
      subscription_data: {
        metadata: {
          restaurantId: restaurant.id,
          userId: session.user.id,
        },
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
