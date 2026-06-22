import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuManager } from "./MenuManager";

export default async function MenuManagementPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const menus = await prisma.menu.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      items: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Menu Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage categories and items shown on your public QR menu.</p>
      </div>

      <MenuManager menus={menus} />
    </div>
  );
}
