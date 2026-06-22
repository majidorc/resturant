import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default async function AdminOverviewPage() {
  const [restaurantCount, userCount, leadCount, feedbackCount, topRestaurants] =
    await Promise.all([
      prisma.restaurant.count(),
      prisma.user.count(),
      prisma.customerLead.count(),
      prisma.feedback.count(),
      prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { leads: true } },
        },
        orderBy: { leads: { _count: "desc" } },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">Platform</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Global Overview</h1>
        <p className="mt-1 text-sm text-slate-500">System-wide analytics across all registered restaurants.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent="admin" label="Registered Restaurants" value={String(restaurantCount)} />
        <MetricCard accent="admin" label="Platform Users" value={String(userCount)} />
        <MetricCard accent="admin" label="Global Leads Collected" value={String(leadCount)} />
        <MetricCard accent="admin" label="Unhappy Feedbacks" value={String(feedbackCount)} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Top Restaurants by Leads</h2>
        </CardHeader>
        {topRestaurants.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-500">No restaurants registered yet.</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-slate-100/80">
            {topRestaurants.map((restaurant, index) => (
              <li
                className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-200 hover:bg-indigo-50/30"
                key={restaurant.id}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{restaurant.name}</p>
                    <p className="text-xs text-slate-400">/{restaurant.slug}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{restaurant._count.leads}</p>
                  <p className="text-xs text-slate-400">leads</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-sm text-slate-500">
        Manage tenants in{" "}
        <Link className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500" href="/admin/restaurants">
          Restaurants
        </Link>{" "}
        or review complaints in{" "}
        <Link className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500" href="/admin/feedback">
          Global Feedback
        </Link>
        .
      </p>
    </div>
  );
}
