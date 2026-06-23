"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  collectLegacyUploadPaths,
  deleteRestaurantUploadDirectory,
  deleteUploadFiles,
} from "@/lib/upload-cleanup";

export type AdminActionState = {
  error?: string;
  success?: boolean;
};

export async function setRestaurantActive(
  restaurantId: string,
  isActive: boolean,
): Promise<AdminActionState> {
  try {
    await getRequiredSuperAdminSession();

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/restaurants");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] Failed to update restaurant status:", error);
    return { error: "Could not update restaurant status." };
  }
}

export async function deleteRestaurant(restaurantId: string): Promise<AdminActionState> {
  try {
    await getRequiredSuperAdminSession();

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        userId: true,
        logoUrl: true,
        user: { select: { role: true } },
        menus: {
          select: {
            items: {
              select: { images: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return { error: "Restaurant not found." };
    }

    if (restaurant.user.role === "SUPERADMIN") {
      return { error: "Cannot delete super admin accounts." };
    }

    const legacyUploadPaths = collectLegacyUploadPaths(
      restaurantId,
      restaurant.logoUrl,
      restaurant.menus.flatMap((menu) => menu.items.map((item) => item.images)),
    );

    await deleteRestaurantUploadDirectory(restaurantId);
    await deleteUploadFiles(legacyUploadPaths);

    await prisma.$transaction([
      prisma.restaurant.delete({ where: { id: restaurantId } }),
      prisma.user.delete({ where: { id: restaurant.userId } }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/admin/restaurants");
    revalidatePath("/dashboard");
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] Failed to delete restaurant:", error);
    return { error: "Could not delete restaurant." };
  }
}
