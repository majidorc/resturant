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

  if (session.user.role === "SUPERADMIN") {
    throw new Error("Super admin accounts cannot access tenant resources");
  }

  if (!restaurantId) {
    throw new Error("No restaurant linked to this account");
  }

  return { session, restaurantId };
}

export async function getRequiredSuperAdminSession() {
  const session = await getRequiredSession();

  if (session.user.role !== "SUPERADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}
