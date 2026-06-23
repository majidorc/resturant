import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PublicMenuExperience } from "@/components/menu/PublicMenuExperience";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { resolveMenuLocale } from "@/lib/i18n";
import { isMenuLanguage, parseMenuLanguages } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/types/dictionary";
import { asTranslationField } from "@/lib/translations";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieLocale = await getLocale();
  const dict = getDictionary(cookieLocale);

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      menus: {
        where: { isActive: true },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!restaurant || !restaurant.isActive) {
    notFound();
  }

  const enabledLanguages = parseMenuLanguages(restaurant.languages);
  const locale = resolveMenuLocale(cookieLocale, restaurant.languages, restaurant.uiLanguage);
  const switcherLocales = enabledLanguages.filter((language): language is Locale =>
    isMenuLanguage(language),
  );
  const serializedMenus = restaurant.menus.map((menu) => ({
    id: menu.id,
    name: asTranslationField(menu.name),
    items: menu.items.map((item) => ({
      id: item.id,
      name: asTranslationField(item.name),
      description: asTranslationField(item.description),
      price: item.price,
      imageUrl: item.imageUrl,
    })),
  }));

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-28">
      <header className="relative border-b border-slate-200 bg-white px-4 py-5">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher availableLocales={switcherLocales} />
        </div>
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          {dict.publicMenu.digitalMenu}
        </p>
        <h1 className="mt-1 text-center text-2xl font-semibold tracking-tight text-slate-900">
          {restaurant.name}
        </h1>
      </header>

      <PublicMenuExperience
        currency={restaurant.currency}
        enabledLanguages={enabledLanguages}
        locale={locale}
        menus={serializedMenus}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </main>
  );
}
