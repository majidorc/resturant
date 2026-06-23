import type { MenuLanguage } from "@/lib/locale";
import { parseMenuLanguages } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import {
  extractTranslationsFromFormData,
  hasRequiredTranslations,
  toPrismaJson,
} from "@/lib/translations";

export async function getRestaurantMenuLanguages(restaurantId: string): Promise<MenuLanguage[]> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { languages: true },
  });

  return parseMenuLanguages(restaurant?.languages ?? ["en"]);
}

export function buildMenuTranslationPayload(
  formData: FormData,
  languages: MenuLanguage[],
  prefix: "name" | "description",
  required: boolean,
): { ok: true; value: ReturnType<typeof toPrismaJson> } | { ok: false; error: string } {
  const map = extractTranslationsFromFormData(formData, prefix, languages);

  if (required && !hasRequiredTranslations(map, languages)) {
    return { ok: false, error: "All enabled language fields are required." };
  }

  return { ok: true, value: toPrismaJson(map) };
}
