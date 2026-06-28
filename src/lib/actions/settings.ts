"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isSupportedCurrency,
  isSupportedLanguage,
  parseMenuLanguages,
} from "@/lib/locale";
import {
  isAllowedUploadPathForRestaurant,
  isValidUploadPath,
} from "@/lib/upload-constants";
import { deleteUploadFile } from "@/lib/upload-cleanup";
import { parseOptionalHttpUrl } from "@/lib/social-urls";
import { parseGoogleReviewInput } from "@/lib/google-place-id";
import { PLAN_LIMITS, planUpgradeRequiredMessage } from "@/lib/plan";
import { getRestaurantPlanAccessById } from "@/lib/plan-server";

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
    const planAccess = await getRestaurantPlanAccessById(restaurantId);
    const isFreeTier = planAccess?.isFreeTier ?? true;

    const wifiSsid = formData.get("wifiSsid")?.toString().trim() || null;
    const wifiPassword = formData.get("wifiPassword")?.toString() || null;
    const googlePlaceIdInput = formData.get("googlePlaceId")?.toString() ?? "";
    const googleReviewUrlFallback = formData.get("googleReviewUrl")?.toString() ?? "";
    const googleReviewResult = await parseGoogleReviewInput(
      googlePlaceIdInput.trim() || googleReviewUrlFallback,
    );
    if (!googleReviewResult.ok) {
      return { error: googleReviewResult.error };
    }
    const googleReviewUrl = googleReviewResult.value;
    const currency = formData.get("currency")?.toString().trim() ?? "USD";
    const uiLanguage = formData.get("uiLanguage")?.toString().trim() ?? "en";
    const languages = parseMenuLanguages(
      formData.getAll("languages").map((value) => value.toString()),
    );
    const logoUrl = formData.get("logoUrl")?.toString().trim() || null;
    const city = formData.get("city")?.toString().trim() || null;
    const country = formData.get("country")?.toString().trim() || null;
    const tablesCountRaw = formData.get("tablesCount")?.toString().trim() ?? "0";
    const tablesCount = Number.parseInt(tablesCountRaw, 10);

    const instagramResult = parseOptionalHttpUrl(formData.get("instagramUrl"), "Instagram URL");
    if (!instagramResult.ok) {
      return { error: instagramResult.error };
    }

    const facebookResult = parseOptionalHttpUrl(formData.get("facebookUrl"), "Facebook URL");
    if (!facebookResult.ok) {
      return { error: facebookResult.error };
    }

    const tiktokResult = parseOptionalHttpUrl(formData.get("tiktokUrl"), "TikTok URL");
    if (!tiktokResult.ok) {
      return { error: tiktokResult.error };
    }

    const whatsappResult = parseOptionalHttpUrl(formData.get("whatsappUrl"), "WhatsApp URL");
    if (!whatsappResult.ok) {
      return { error: whatsappResult.error };
    }

    if (logoUrl && !isAllowedUploadPathForRestaurant(logoUrl, restaurantId)) {
      return { error: "Invalid logo path." };
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { logoUrl: true },
    });

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

    if (isFreeTier && languages.length > PLAN_LIMITS.freeMaxLanguages) {
      return {
        error: planUpgradeRequiredMessage(
          `Free plans include up to ${PLAN_LIMITS.freeMaxLanguages} menu language`,
        ),
      };
    }

    if (isFreeTier && tablesCount > 0) {
      return {
        error: planUpgradeRequiredMessage("Table QR codes and the Waiter Screen"),
      };
    }

    if (Number.isNaN(tablesCount) || tablesCount < 0 || tablesCount > 500) {
      return { error: "Total operational tables must be between 0 and 500." };
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
        logoUrl,
        city,
        country,
        instagramUrl: instagramResult.value,
        facebookUrl: facebookResult.value,
        tiktokUrl: tiktokResult.value,
        whatsappUrl: whatsappResult.value,
        tablesCount,
      },
      select: { slug: true },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/menu");
    revalidatePath(`/menu/${updated.slug}`);
    revalidatePath("/restaurants");

    const previousLogo = existingRestaurant?.logoUrl;
    if (previousLogo && previousLogo !== logoUrl && isValidUploadPath(previousLogo)) {
      await deleteUploadFile(previousLogo);
    }

    return { success: true };
  } catch {
    return { error: "Failed to update settings." };
  }
}
