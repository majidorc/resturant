import Link from "next/link";
import { MapPin, Store, UtensilsCrossed } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";

export default async function RestaurantsDirectoryPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.directory;

  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      city: true,
      country: true,
    },
    orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }],
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 transition-colors hover:text-amber-600"
            href="/"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-950">
              R
            </span>
            ReviewBite
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            ReviewBite
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{d.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{d.subtitle}</p>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
            {d.noRestaurants}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => {
              const location = [restaurant.city, restaurant.country].filter(Boolean).join(", ");

              return (
                <article
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  key={restaurant.id}
                >
                  <div className="flex items-start gap-4">
                    {restaurant.logoUrl ? (
                      <img
                        alt={`${restaurant.name} logo`}
                        className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                        src={restaurant.logoUrl}
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Store className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {restaurant.name}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {location || d.locationUnknown}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                      Digital Menu
                    </span>
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-medium text-slate-950 shadow-sm transition-all duration-200 hover:bg-amber-400"
                      href={`/menu/${restaurant.slug}`}
                    >
                      {d.viewMenu}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
