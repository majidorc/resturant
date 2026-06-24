import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PublicMenuExperience } from "@/components/menu/PublicMenuExperience";
import { RestaurantSocialLinks } from "@/components/menu/RestaurantSocialLinks";
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
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-md"
        id="public-menu-header"
      >
        <div className="relative mx-auto max-w-lg">
          <div className="absolute right-0 top-0 z-30">
            <LanguageSwitcher availableLocales={switcherLocales} />
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 pr-24 sm:pr-28">
            {restaurant.logoUrl ? (
              <img
                alt={`${restaurant.name} logo`}
                className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
                src={restaurant.logoUrl}
              />
            ) : null}

            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {dict.publicMenu.digitalMenu}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {restaurant.name}
              </h1>
              {location ? (
                <p className="mt-1 text-sm text-slate-500">{location}</p>
              ) : null}
              <RestaurantSocialLinks
                facebookUrl={restaurant.facebookUrl}
                instagramUrl={restaurant.instagramUrl}
                locationLabel={dict.publicMenu.openLocation}
                locationUrl={locationUrl}
                tiktokUrl={restaurant.tiktokUrl}
                whatsappUrl={restaurant.whatsappUrl}
              />
            </div>
          </div>
        </div>
      </header>

      <PublicMenuExperience
        currency={restaurant.currency}
        enabledLanguages={enabledLanguages}
        locale={locale}
        menus={serializedMenus}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        tableNumber={tableNumber}
      />
    </main>
  );
}
