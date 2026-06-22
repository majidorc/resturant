"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isSupportedCurrency, isSupportedLanguage } from "@/lib/locale";

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
    const currency = formData.get("currency")?.toString().trim() ?? "USD";
    const language = formData.get("language")?.toString().trim() ?? "en";

    if (googleReviewUrl && !googleReviewUrl.startsWith("http")) {
      return { error: "Google Review URL must start with http:// or https://" };
    }

    if (!isSupportedCurrency(currency)) {
      return { error: "Please select a supported currency." };
    }

    if (!isSupportedLanguage(language)) {
      return { error: "Please select a supported language." };
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        wifiSsid,
        wifiPassword,
        googleReviewUrl,
        currency,
        language,
      },
      select: { slug: true },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/menu/${updated.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to update settings." };
  }
}
