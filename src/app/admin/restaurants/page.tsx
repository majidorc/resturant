import { prisma } from "@/lib/prisma";
import { RestaurantMenuActions } from "@/components/admin/RestaurantMenuActions";

export default async function AdminRestaurantsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const restaurants = await prisma.restaurant.findMany({
    include: {
      user: {
        select: { email: true },
      },
      _count: {
        select: { menus: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Restaurant Registry</h1>
        <p className="mt-1 text-sm text-zinc-600">
          All tenant venues registered on the platform.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No restaurants registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Restaurant</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Owner Email</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Created</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Menu Categories</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td className="px-5 py-4 font-medium text-zinc-900">{restaurant.name}</td>
                  <td className="px-5 py-4 text-zinc-700">{restaurant.user.email}</td>
                  <td className="px-5 py-4 text-zinc-600">
                    {restaurant.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{restaurant._count.menus}</td>
                  <td className="px-5 py-4">
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
