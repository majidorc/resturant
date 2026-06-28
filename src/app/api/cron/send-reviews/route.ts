import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewEmail } from "@/lib/mailer";
import { isValidCronRequest } from "@/lib/cron-auth";
import { resolvePlanAccess } from "@/lib/plan";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!isValidCronRequest(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const minAgeMinutes = Number(process.env.REVIEW_EMAIL_MIN_AGE_MINUTES ?? "1380");
    const maxAgeMinutes = Number(process.env.REVIEW_EMAIL_MAX_AGE_MINUTES ?? "1500");
    const newestEligible = new Date(now.getTime() - minAgeMinutes * 60 * 1000);
    const oldestEligible = new Date(now.getTime() - maxAgeMinutes * 60 * 1000);

    const pendingLeads = await prisma.customerLead.findMany({
      where: {
        emailSent: false,
        createdAt: {
          gte: oldestEligible,
          lte: newestEligible,
        },
        restaurant: { isActive: true },
      },
      include: {
        restaurant: true,
      },
    });

    let emailsProcessed = 0;
    let emailsFailed = 0;
    let skipped = 0;

    for (const lead of pendingLeads) {
      try {
        const planAccess = resolvePlanAccess(lead.restaurant);
        if (!planAccess.hasProAccess) {
          skipped++;
          continue;
        }

        const claim = await prisma.customerLead.updateMany({
          where: { id: lead.id, emailSent: false },
          data: { emailSent: true },
        });

        if (claim.count === 0) {
          skipped++;
          continue;
        }

        const result = await sendReviewEmail({
          to: lead.email,
          restaurantName: lead.restaurant.name,
          leadId: lead.id,
        });

        if (!result.success) {
          await prisma.customerLead.update({
            where: { id: lead.id },
            data: { emailSent: false },
          });
          emailsFailed++;
          console.error(`[CRON] Email not sent for lead ${lead.id}: ${result.error ?? "unknown"}`);
          continue;
        }

        emailsProcessed++;
      } catch (error) {
        await prisma.customerLead
          .update({
            where: { id: lead.id },
            data: { emailSent: false },
          })
          .catch(() => undefined);
        emailsFailed++;
        console.error(`[CRON] Failed processing lead ${lead.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: emailsProcessed,
      failed: emailsFailed,
      skipped,
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
