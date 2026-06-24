"use server";

import { revalidatePath } from "next/cache";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/settings";

export async function archiveTableServiceRequest(requestId: string): Promise<ActionState> {
  try {
    const { restaurantId } = await getRequiredRestaurantId();

    const existing = await prisma.tableServiceRequest.findFirst({
      where: { id: requestId, restaurantId, status: "PENDING" },
      select: { id: true },
    });

    if (!existing) {
      return { error: "Request not found or already completed." };
    }

    await prisma.tableServiceRequest.update({
      where: { id: requestId },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/dashboard/waiters");

    return { success: true };
  } catch {
    return { error: "Failed to update request." };
  }
}
