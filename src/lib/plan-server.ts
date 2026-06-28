import { prisma } from "@/lib/prisma";
import { resolvePlanAccess, type PlanAccess } from "@/lib/plan";

const planSelect = {
  plan: true,
  subscriptionStatus: true,
  trialEndsAt: true,
} as const;

export async function getRestaurantPlanAccessById(restaurantId: string): Promise<PlanAccess | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: planSelect,
  });

  if (!restaurant) {
    return null;
  }

  return resolvePlanAccess(restaurant);
}

export async function getRestaurantPlanAccessByUserId(userId: string): Promise<PlanAccess | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: planSelect,
  });

  if (!restaurant) {
    return null;
  }

  return resolvePlanAccess(restaurant);
}

export async function countLeadsThisMonth(restaurantId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return prisma.customerLead.count({
    where: {
      restaurantId,
      createdAt: { gte: monthStart },
    },
  });
}
