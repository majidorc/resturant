import { NextResponse } from "next/server";
import { getRequiredRestaurantId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { escapeCsvValue } from "@/lib/csv";
import { getRestaurantPlanAccessById } from "@/lib/plan-server";

export async function GET() {
  try {
    const { restaurantId } = await getRequiredRestaurantId();
    const planAccess = await getRestaurantPlanAccessById(restaurantId);

    if (!planAccess?.hasProAccess) {
      return NextResponse.json(
        { error: "Lead export is available on Pro plans only." },
        { status: 403 },
      );
    }

    const leads = await prisma.customerLead.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    const header = ["email", "source", "email_sent", "captured_at"];
    const rows = leads.map((lead) =>
      [
        escapeCsvValue(lead.email),
        escapeCsvValue(lead.source),
        lead.emailSent ? "yes" : "no",
        lead.createdAt.toISOString(),
      ].join(","),
    );

    const csv = [header.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reviewbite-leads-${restaurantId}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
