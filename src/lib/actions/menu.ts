"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/settings";
import { buildMenuTranslationPayload, getRestaurantMenuLanguages } from "@/lib/menu-form";
import { PLAN_LIMITS, planUpgradeRequiredMessage } from "@/lib/plan";
import { getRestaurantPlanAccessById } from "@/lib/plan-server";
import { parseImagesFieldForRestaurant } from "@/lib/upload-constants";
import {
  deleteUploadFiles,
  getRemovedUploadPaths,
} from "@/lib/upload-cleanup";

async function verifyMenuOwnership(menuId: string, restaurantId: string) {
  const menu = await prisma.menu.findFirst({
    where: { id: menuId, restaurantId },
  });

  if (!menu) {
    throw new Error("Menu not found");
  }

  return menu;
}

async function verifyMenuItemOwnership(itemId: string, restaurantId: string) {
  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      menu: { restaurantId },
    },
  });

  if (!item) {
    throw new Error("Menu item not found");
  }

  return item;
}

export async function createMenu(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    const planAccess = await getRestaurantPlanAccessById(restaurantId);

    if (planAccess?.isFreeTier) {
      const menuCount = await prisma.menu.count({ where: { restaurantId } });
      if (menuCount >= PLAN_LIMITS.freeMaxMenus) {
        return {
          error: planUpgradeRequiredMessage(
            `Free plans include up to ${PLAN_LIMITS.freeMaxMenus} menu category`,
          ),
        };
      }
    }

    const languages = await getRestaurantMenuLanguages(restaurantId);
    const nameResult = buildMenuTranslationPayload(formData, languages, "name", true);

    if (!nameResult.ok) {
      return { error: nameResult.error };
    }

    await prisma.menu.create({
      data: {
        restaurantId,
        name: nameResult.value,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to create menu." };
  }
}

export async function toggleMenuActive(menuId: string, isActive: boolean): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    await verifyMenuOwnership(menuId, restaurantId);

    await prisma.menu.update({
      where: { id: menuId },
      data: { isActive },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to update menu." };
  }
}

export async function createMenuItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    const languages = await getRestaurantMenuLanguages(restaurantId);
    const menuId = formData.get("menuId")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const images = parseImagesFieldForRestaurant(formData.get("images"), restaurantId);
    const nameResult = buildMenuTranslationPayload(formData, languages, "name", true);
    const descriptionResult = buildMenuTranslationPayload(
      formData,
      languages,
      "description",
      false,
    );

    if (!menuId || !priceRaw) {
      return { error: "Menu category and price are required." };
    }

    if (!nameResult.ok) {
      return { error: nameResult.error };
    }

    if (!descriptionResult.ok) {
      return { error: descriptionResult.error };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    await verifyMenuOwnership(menuId, restaurantId);

    await prisma.menuItem.create({
      data: {
        menuId,
        name: nameResult.value,
        description: descriptionResult.value,
        price,
        images,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to create menu item." };
  }
}

export async function updateMenuItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    const languages = await getRestaurantMenuLanguages(restaurantId);
    const itemId = formData.get("itemId")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const images = parseImagesFieldForRestaurant(formData.get("images"), restaurantId);
    const isAvailable = formData.get("isAvailable") === "true";
    const nameResult = buildMenuTranslationPayload(formData, languages, "name", true);
    const descriptionResult = buildMenuTranslationPayload(
      formData,
      languages,
      "description",
      false,
    );

    if (!itemId || !priceRaw) {
      return { error: "Item and price are required." };
    }

    if (!nameResult.ok) {
      return { error: nameResult.error };
    }

    if (!descriptionResult.ok) {
      return { error: descriptionResult.error };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    const existingItem = await verifyMenuItemOwnership(itemId, restaurantId);
    const removedImages = getRemovedUploadPaths(existingItem.images, images);

    await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name: nameResult.value,
        description: descriptionResult.value,
        price,
        images,
        isAvailable,
      },
    });

    await deleteUploadFiles(removedImages);

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to update menu item." };
  }
}

export async function deleteMenuItem(itemId: string): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    const existingItem = await verifyMenuItemOwnership(itemId, restaurantId);

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    await deleteUploadFiles(existingItem.images);

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to delete menu item." };
  }
}
