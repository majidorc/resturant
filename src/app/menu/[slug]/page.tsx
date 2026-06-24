import { notFound } from "next/navigation";
import { PublicMenuExperience } from "@/components/menu/PublicMenuExperience";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { resolveMenuLocale } from "@/lib/i18n";
import { isMenuLanguage, parseMenuLanguages } from "@/lib/locale";
import { buildGoogleMapsLocationUrl } from "@/lib/google-place-id";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/types/dictionary";
import { asTranslationField } from "@/lib/translations";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string | string[] }>;
};

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const tableParam = query.table;
  const tableNumber =
    typeof tableParam === "string" && tableParam.trim().length > 0
      ? tableParam.trim().slice(0, 32)
      : null;
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
      images: item.images,
    })),
  }));

  const location = [restaurant.city, restaurant.country].filter(Boolean).join(", ");
  const locationUrl = buildGoogleMapsLocationUrl(restaurant.googleReviewUrl);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicMenuExperience
        currency={restaurant.currency}
        digitalMenuLabel={dict.publicMenu.digitalMenu}
        enabledLanguages={enabledLanguages}
        locale={locale}
        location={location || undefined}
        logoUrl={restaurant.logoUrl}
        menus={serializedMenus}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        socialLinks={{
          facebookUrl: restaurant.facebookUrl,
          instagramUrl: restaurant.instagramUrl,
          locationLabel: dict.publicMenu.openLocation,
          locationUrl: locationUrl,
          tiktokUrl: restaurant.tiktokUrl,
          whatsappUrl: restaurant.whatsappUrl,
        }}
        switcherLocales={switcherLocales}
        tableNumber={tableNumber}
      />
    </main>
  );
}
