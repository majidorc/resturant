import { prisma } from "@/lib/prisma";
import { AdminRestaurantActions } from "@/components/admin/AdminRestaurantActions";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminRestaurantsPage() {
  const locale = await getLocale();
  const a = getDictionary(locale).admin;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const restaurants = await prisma.restaurant.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { menus: true, leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {a.registryEyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{a.registryTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{a.registrySubtitle}</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          {a.noRestaurants}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colRestaurant}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colStatus}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colOwnerEmail}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colLeads}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colCreated}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {restaurants.map((restaurant) => (
                <tr className="transition-colors duration-200 hover:bg-slate-50" key={restaurant.id}>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <p>{restaurant.name}</p>
                    <p className="text-xs text-slate-500">/{restaurant.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={restaurant.isActive ? "success" : "warning"}>
                      {restaurant.isActive ? a.statusActive : a.statusInactive}
                    </Badge>
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">
                    {restaurant.user.email}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{restaurant._count.leads}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {restaurant.createdAt.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="min-w-[280px] px-6 py-4">
                    <AdminRestaurantActions
                      isActive={restaurant.isActive}
                      labels={{
                        activate: a.activateRestaurant,
                        deactivate: a.deactivateRestaurant,
                        delete: a.deleteRestaurant,
                        confirmDelete: a.confirmDeleteRestaurant,
                        openMenu: a.openMenu,
                        active: a.statusActive,
                        inactive: a.statusInactive,
                      }}
                      publicMenuUrl={`${baseUrl}/menu/${restaurant.slug}`}
                      restaurantId={restaurant.id}
                      slug={restaurant.slug}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
