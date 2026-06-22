import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default async function AdminOverviewPage() {
  const [
    restaurantCount,
    userCount,
    leadCount,
    feedbackCount,
    topRestaurants,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.customerLead.count(),
    prisma.feedback.count(),
    prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { leads: true },
        },
      },
      orderBy: {
        leads: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-zinc-600">
          System-wide analytics across all registered restaurants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Registered Restaurants" value={String(restaurantCount)} />
        <MetricCard label="Platform Users" value={String(userCount)} />
        <MetricCard label="Global Leads Collected" value={String(leadCount)} />
        <MetricCard label="Unhappy Feedbacks" value={String(feedbackCount)} />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Top Restaurants by Leads</h2>
        </div>

        {topRestaurants.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-500">No restaurants registered yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {topRestaurants.map((restaurant, index) => (
              <li
                className="flex items-center justify-between gap-4 px-5 py-4"
                key={restaurant.id}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900">{restaurant.name}</p>
                    <p className="text-xs text-zinc-500">/{restaurant.slug}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">
                    {restaurant._count.leads}
                  </p>
                  <p className="text-xs text-zinc-500">leads</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-zinc-600">
        Manage tenants in{" "}
        <Link className="font-medium text-zinc-900 underline" href="/admin/restaurants">
          Restaurants
        </Link>{" "}
        or review complaints in{" "}
        <Link className="font-medium text-zinc-900 underline" href="/admin/feedback">
          Global Feedback
        </Link>
        .
      </p>
    </div>
  );
}
