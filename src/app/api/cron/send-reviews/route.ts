import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewEmail } from "@/lib/mailer";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    const pendingLeads = await prisma.customerLead.findMany({
      where: {
        emailSent: false,
        createdAt: {
          gte: twentyFiveHoursAgo,
          lte: twentyThreeHoursAgo,
        },
      },
      include: {
        restaurant: true,
      },
    });

    let emailsProcessed = 0;
    let emailsFailed = 0;

    for (const lead of pendingLeads) {
      try {
        const result = await sendReviewEmail({
          to: lead.email,
          restaurantName: lead.restaurant.name,
          leadId: lead.id,
        });

        if (!result.success) {
          emailsFailed++;
          console.error(`[CRON] Email not sent for lead ${lead.id}: ${result.error ?? "unknown"}`);
          continue;
        }

        await prisma.customerLead.update({
          where: { id: lead.id },
          data: { emailSent: true },
        });

        emailsProcessed++;
      } catch (error) {
        emailsFailed++;
        console.error(`[CRON] Failed processing lead ${lead.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: emailsProcessed,
      failed: emailsFailed,
      queued: pendingLeads.length,
    });
  } catch (error) {
    console.error("[CRON] Review routine error:", error);
    return NextResponse.json({ error: "Internal automation breakdown" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
