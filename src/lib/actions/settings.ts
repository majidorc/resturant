"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isSupportedCurrency,
  isSupportedLanguage,
  parseMenuLanguages,
} from "@/lib/locale";

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
    const uiLanguage = formData.get("uiLanguage")?.toString().trim() ?? "en";
    const languages = parseMenuLanguages(
      formData.getAll("languages").map((value) => value.toString()),
    );

    if (googleReviewUrl && !googleReviewUrl.startsWith("http")) {
      return { error: "Google Review URL must start with http:// or https://" };
    }

    if (!isSupportedCurrency(currency)) {
      return { error: "Please select a supported currency." };
    }

    if (!isSupportedLanguage(uiLanguage)) {
      return { error: "Please select a supported dashboard language." };
    }

    if (!languages.includes(uiLanguage)) {
      return { error: "Dashboard language must be included in supported menu languages." };
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        wifiSsid,
        wifiPassword,
        googleReviewUrl,
        currency,
        uiLanguage,
        languages,
      },
      select: { slug: true },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/menu");
    revalidatePath(`/menu/${updated.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to update settings." };
  }
}
