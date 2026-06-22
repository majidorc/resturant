import { prisma } from "@/lib/prisma";
import { RestaurantMenuActions } from "@/components/admin/RestaurantMenuActions";
import { Card, CardBody } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">Registry</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Restaurant Registry</h1>
        <p className="mt-1 text-sm text-slate-500">All tenant venues registered on the platform.</p>
      </div>

      {restaurants.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            No restaurants registered yet.
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50/60">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Restaurant</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Owner Email</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Created</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Categories</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {restaurants.map((restaurant) => (
                  <tr className="transition-all duration-200 hover:bg-slate-50/50" key={restaurant.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">{restaurant.name}</td>
                    <td className="px-5 py-4 text-slate-600">{restaurant.user.email}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {restaurant.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{restaurant._count.menus}</td>
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
        </Card>
      )}
    </div>
  );
}
