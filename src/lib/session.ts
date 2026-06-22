import { auth } from "@/lib/auth";

export async function getRequiredSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getRequiredRestaurantId() {
  const session = await getRequiredSession();
  const restaurantId = session.user.restaurantId;

  if (!restaurantId) {
    throw new Error("No restaurant linked to this account");
  }

  return { session, restaurantId };
}
