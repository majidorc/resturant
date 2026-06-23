import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { MenuManager } from "./MenuManager";
import { parseMenuLanguages } from "@/lib/locale";
import { asTranslationField } from "@/lib/translations";

export default async function MenuManagementPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, currency: true, languages: true },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const menus = await prisma.menu.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      items: {
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  const languages = parseMenuLanguages(restaurant.languages);
  const serializedMenus = menus.map((menu) => ({
    id: menu.id,
    name: asTranslationField(menu.name),
    isActive: menu.isActive,
    items: menu.items.map((item) => ({
      id: item.id,
      name: asTranslationField(item.name),
      description: asTranslationField(item.description),
      price: item.price,
      images: item.images,
      isAvailable: item.isAvailable,
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{dict.dashboard.menuTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{dict.dashboard.menuSubtitle}</p>
      </div>

      <MenuManager currency={restaurant.currency} languages={languages} menus={serializedMenus} />
    </div>
  );
}
