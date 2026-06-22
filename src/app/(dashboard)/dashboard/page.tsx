import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-amber-800">No restaurant is linked to this account yet.</p>
        </CardBody>
      </Card>
    );
  }

  const [totalLeads, emailedLeads, feedbackCount, recentLeads] = await Promise.all([
    prisma.customerLead.count({ where: { restaurantId: restaurant.id } }),
    prisma.customerLead.count({
      where: { restaurantId: restaurant.id, emailSent: true },
    }),
    prisma.feedback.count({ where: { restaurantId: restaurant.id } }),
    prisma.customerLead.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, source: true, createdAt: true },
    }),
  ]);

  const conversionRate =
    totalLeads === 0 ? 0 : Math.round((emailedLeads / totalLeads) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Performance snapshot for {restaurant.name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          hint="Captured through Wi-Fi unlock"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeWidth={1.8} />
            </svg>
          }
          label="Total Leads Collected"
          value={String(totalLeads)}
        />
        <MetricCard
          hint={`${emailedLeads} leads received review emails`}
          label="Review Conversion"
          trend={conversionRate > 0 ? `${conversionRate}%` : undefined}
          value={`${conversionRate}%`}
        />
        <MetricCard
          hint="Private feedback submissions"
          label="Internal Feedback"
          value={String(feedbackCount)}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
        </CardHeader>
        {recentLeads.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-500">No leads captured yet.</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-slate-100/80">
            {recentLeads.map((lead) => (
              <li
                className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-200 hover:bg-slate-50/50"
                key={lead.id}
              >
                <div>
                  <p className="font-medium text-slate-900">{lead.email}</p>
                  <div className="mt-1">
                    <Badge>{lead.source}</Badge>
                  </div>
                </div>
                <time className="text-xs text-slate-400">
                  {lead.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
