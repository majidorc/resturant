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
    const name = formData.get("name")?.toString().trim();

    if (!name) {
      return { error: "Menu name is required." };
    }

    await prisma.menu.create({
      data: { restaurantId, name },
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
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const priceRaw = formData.get("price")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString().trim() || null;

    if (!menuId || !name || !priceRaw) {
      return { error: "Name and price are required." };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    await verifyMenuOwnership(menuId, restaurantId);

    await prisma.menuItem.create({
      data: {
        menuId,
        name,
        description,
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
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const priceRaw = formData.get("price")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString().trim() || null;
    const isAvailable = formData.get("isAvailable") === "true";

    if (!itemId || !name || !priceRaw) {
      return { error: "Name and price are required." };
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      return { error: "Price must be a positive number." };
    }

    await verifyMenuItemOwnership(itemId, restaurantId);

    await prisma.menuItem.update({
      where: { id: itemId },
      data: { name, description, price, imageUrl, isAvailable },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { error: "Failed to update menu item." };
  }
}
