"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/settings";

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
    const nameEn = formData.get("nameEn")?.toString().trim();
    const nameTh = formData.get("nameTh")?.toString().trim();

    if (!nameEn || !nameTh) {
      return { error: "English and Thai category names are required." };
    }

    await prisma.menu.create({
      data: { restaurantId, nameEn, nameTh },
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
    const menuId = formData.get("menuId")?.toString();
    const nameEn = formData.get("nameEn")?.toString().trim();
    const nameTh = formData.get("nameTh")?.toString().trim();
    const descriptionEn = formData.get("descriptionEn")?.toString().trim() || null;
    const descriptionTh = formData.get("descriptionTh")?.toString().trim() || null;
    const priceRaw = formData.get("price")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString().trim() || null;

    if (!menuId || !nameEn || !nameTh || !priceRaw) {
      return { error: "English name, Thai name, and price are required." };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    await verifyMenuOwnership(menuId, restaurantId);

    await prisma.menuItem.create({
      data: {
        menuId,
        nameEn,
        nameTh,
        descriptionEn,
        descriptionTh,
        price,
        imageUrl,
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
    const itemId = formData.get("itemId")?.toString();
    const nameEn = formData.get("nameEn")?.toString().trim();
    const nameTh = formData.get("nameTh")?.toString().trim();
    const descriptionEn = formData.get("descriptionEn")?.toString().trim() || null;
    const descriptionTh = formData.get("descriptionTh")?.toString().trim() || null;
    const priceRaw = formData.get("price")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString().trim() || null;
    const isAvailable = formData.get("isAvailable") === "true";

    if (!itemId || !nameEn || !nameTh || !priceRaw) {
      return { error: "English name, Thai name, and price are required." };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    await verifyMenuItemOwnership(itemId, restaurantId);

    await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        nameEn,
        nameTh,
        descriptionEn,
        descriptionTh,
        price,
        imageUrl,
        isAvailable,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to update menu item." };
  }
}
