import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { interpolate } from "@/lib/get-dictionary";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.dashboard;

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
          <p className="text-sm text-amber-800">{d.noRestaurant}</p>
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
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{d.overviewTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {interpolate(d.overviewSubtitle, { restaurantName: restaurant.name })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          hint={d.totalLeadsHint}
          label={d.totalLeads}
          value={String(totalLeads)}
        />
        <MetricCard
          hint={interpolate(d.reviewConversionHint, { count: emailedLeads })}
          label={d.reviewConversion}
          trend={conversionRate > 0 ? `${conversionRate}%` : undefined}
          value={`${conversionRate}%`}
        />
        <MetricCard hint={d.internalFeedbackHint} label={d.internalFeedback} value={String(feedbackCount)} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-900">{d.recentLeads}</h2>
        </CardHeader>
        {recentLeads.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-500">{d.noLeads}</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <li
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                key={lead.id}
              >
                <div>
                  <p className="font-medium text-zinc-900">{lead.email}</p>
                  <div className="mt-1">
                    <Badge>{lead.source}</Badge>
                  </div>
                </div>
                <time className="text-xs text-slate-500">
                  {lead.createdAt.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
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
