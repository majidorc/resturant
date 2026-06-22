import { prisma } from "@/lib/prisma";
import { RestaurantMenuActions } from "@/components/admin/RestaurantMenuActions";

export default async function AdminRestaurantsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const restaurants = await prisma.restaurant.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { menus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registry</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Restaurant Registry
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          All tenant venues registered on the platform.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          No restaurants registered yet.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Owner Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {restaurants.map((restaurant) => (
                <tr className="transition-colors duration-200 hover:bg-slate-50" key={restaurant.id}>
                  <td className="px-6 py-4 font-medium text-zinc-900">{restaurant.name}</td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">
                    {restaurant.user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {restaurant.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{restaurant._count.menus}</td>
                  <td className="px-6 py-4">
                    <RestaurantMenuActions
                      publicMenuUrl={`${baseUrl}/menu/${restaurant.slug}`}
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
