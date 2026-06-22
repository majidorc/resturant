"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function updateRestaurantSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();

    const wifiSsid = formData.get("wifiSsid")?.toString().trim() || null;
    const wifiPassword = formData.get("wifiPassword")?.toString() || null;
    const googleReviewUrl = formData.get("googleReviewUrl")?.toString().trim() || null;

    if (googleReviewUrl && !googleReviewUrl.startsWith("http")) {
      return { error: "Google Review URL must start with http:// or https://" };
    }

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { wifiSsid, wifiPassword, googleReviewUrl },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { error: "Failed to update settings." };
  }
}
