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

    for (const lead of pendingLeads) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
      const diagnosticReviewUrl = `${baseUrl}/review/${lead.id}`;

      await sendReviewEmail({
        to: lead.email,
        restaurantName: lead.restaurant.name,
        reviewUrl: diagnosticReviewUrl,
      });

      await prisma.customerLead.update({
        where: { id: lead.id },
        data: { emailSent: true },
      });

      emailsProcessed++;
    }

    return NextResponse.json({ success: true, processed: emailsProcessed });
  } catch (error) {
    console.error("Cron Error processing review routine:", error);
    return NextResponse.json({ error: "Internal automation breakdown" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
