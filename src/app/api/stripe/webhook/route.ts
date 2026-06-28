import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata.restaurantId;

  if (!restaurantId) {
    return;
  }

  const status = subscription.status;
  const isPro = status === "active" || status === "trialing";

  await prisma.restaurant.updateMany({
    where: { id: restaurantId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      subscriptionStatus: status,
      plan: isPro ? "PRO" : "FREE",
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const restaurantId = session.metadata?.restaurantId ?? session.client_reference_id;

  if (!restaurantId || session.mode !== "subscription") {
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  await prisma.restaurant.updateMany({
    where: { id: restaurantId },
    data: {
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? undefined,
      stripeSubscriptionId: subscriptionId ?? undefined,
      subscriptionStatus: "active",
      plan: "PRO",
    },
  });

  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription);
  }
}

async function downgradeRestaurant(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata.restaurantId;

  if (!restaurantId) {
    return;
  }

  await prisma.restaurant.updateMany({
    where: { id: restaurantId },
    data: {
      subscriptionStatus: subscription.status,
      plan: "FREE",
      stripeSubscriptionId: null,
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await downgradeRestaurant(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
