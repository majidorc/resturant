import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { MenuManager } from "./MenuManager";

export default async function MenuManagementPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, currency: true },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const menus = await prisma.menu.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      items: {
        orderBy: { nameEn: "asc" },
      },
    },
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{dict.dashboard.menuTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{dict.dashboard.menuSubtitle}</p>
      </div>

      <MenuManager currency={restaurant.currency} menus={menus} />
    </div>
  );
}
