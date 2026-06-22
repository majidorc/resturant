import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No restaurant is linked to this account yet.
      </div>
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
        <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Performance snapshot for {restaurant.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Leads Collected" value={String(totalLeads)} />
        <MetricCard
          hint={`${emailedLeads} leads received review emails`}
          label="Review Conversion"
          value={`${conversionRate}%`}
        />
        <MetricCard label="Internal Feedback" value={String(feedbackCount)} />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Leads</h2>
        </div>

        {recentLeads.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-500">No leads captured yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {recentLeads.map((lead) => (
              <li className="flex items-center justify-between gap-4 px-5 py-4" key={lead.id}>
                <div>
                  <p className="font-medium text-zinc-900">{lead.email}</p>
                  <p className="text-xs text-zinc-500">Source: {lead.source}</p>
                </div>
                <time className="text-xs text-zinc-500">
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
      </section>
    </div>
  );
}
