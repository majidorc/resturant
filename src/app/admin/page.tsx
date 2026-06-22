import { Building2, MessageSquareWarning, Store, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

type MetricProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

function AdminMetricCard({ label, value, icon }: MetricProps) {
  return (
    <div className="flex min-h-[140px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const a = dict.admin;

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
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{a.overviewEyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{a.overviewTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{a.overviewSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <AdminMetricCard
          icon={<Store className="h-4 w-4" />}
          label={a.registeredRestaurants}
          value={String(restaurantCount)}
        />
        <AdminMetricCard
          icon={<Users className="h-4 w-4" />}
          label={a.platformUsers}
          value={String(userCount)}
        />
        <AdminMetricCard
          icon={<Building2 className="h-4 w-4" />}
          label={a.globalLeads}
          value={String(leadCount)}
        />
        <AdminMetricCard
          icon={<MessageSquareWarning className="h-4 w-4" />}
          label={a.unhappyFeedbacks}
          value={String(feedbackCount)}
        />
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">{a.topRestaurants}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{a.topRestaurantsSubtitle}</p>
        </div>
        {topRestaurants.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            {a.noRestaurants}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {topRestaurants.map((restaurant, index) => (
              <li
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors duration-200 hover:bg-slate-50"
                key={restaurant.id}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">{restaurant.name}</p>
                    <p className="truncate text-xs text-slate-500">/{restaurant.slug}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-zinc-900">{restaurant._count.leads}</p>
                  <p className="text-xs text-slate-500">{a.leads}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
