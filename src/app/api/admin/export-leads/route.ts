import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeCsvValue } from "@/lib/csv";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId")?.trim() || undefined;

  const leads = await prisma.customerLead.findMany({
    where: restaurantId ? { restaurantId } : undefined,
    include: {
      restaurant: {
        select: { name: true, slug: true, isActive: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = ["email", "restaurant", "slug", "source", "email_sent", "captured_at"];
  const rows = leads.map((lead) =>
    [
      escapeCsvValue(lead.email),
      escapeCsvValue(lead.restaurant.name),
      escapeCsvValue(lead.restaurant.slug),
      escapeCsvValue(lead.source),
      lead.emailSent ? "yes" : "no",
      lead.createdAt.toISOString(),
    ].join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = restaurantId ? `leads-${restaurantId}.csv` : "customer-leads.csv";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
