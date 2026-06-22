"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDictionary } from "@/components/LocaleProvider";
import { pickLocalizedOptional, pickLocalizedText } from "@/lib/i18n";
import { formatMenuPrice } from "@/lib/locale";
import type { Locale } from "@/types/dictionary";

type MenuItemData = {
  id: string;
  nameEn: string;
  nameTh: string;
  descriptionEn: string | null;
  descriptionTh: string | null;
  price: number;
  imageUrl: string | null;
};

type MenuData = {
  id: string;
  nameEn: string;
  nameTh: string;
  items: MenuItemData[];
};

type MenuListProps = {
  menus: MenuData[];
  currency: string;
  locale: Locale;
};

function MenuItemImage({ imageUrl, name }: { imageUrl: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 md:h-24 md:w-24">
        <UtensilsCrossed className="h-6 w-6" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 md:h-24 md:w-24">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
      <img
        alt={name}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        src={imageUrl}
      />
    </div>
  );
}

export function MenuList({ menus, currency, locale }: MenuListProps) {
  const dict = useDictionary();
  const [activeId, setActiveId] = useState(menus[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!menus.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0.1, 0.4, 0.7] },
    );

    menus.forEach((menu) => {
      const node = sectionRefs.current[menu.id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [menus]);

  function scrollToCategory(menuId: string) {
    setActiveId(menuId);
    sectionRefs.current[menuId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (menus.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-slate-500">{dict.publicMenu.noItems}</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menus.map((menu) => (
            <button
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeId === menu.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              key={menu.id}
              onClick={() => scrollToCategory(menu.id)}
              type="button"
            >
              {pickLocalizedText(locale, menu.nameEn, menu.nameTh)}
            </button>
          ))}
        </div>
      </nav>

      <div className="space-y-6 px-4 py-6">
        {menus.map((menu, menuIndex) => {
          const menuName = pickLocalizedText(locale, menu.nameEn, menu.nameTh);

          return (
            <section
              className="scroll-mt-28"
              id={menu.id}
              key={menu.id}
              ref={(node) => {
                sectionRefs.current[menu.id] = node;
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{menuName}</h2>
                <Badge>
                  {menu.items.length} {dict.common.items}
                </Badge>
              </div>

              <ul className="space-y-3">
                {menu.items.map((item, itemIndex) => {
                  const itemName = pickLocalizedText(locale, item.nameEn, item.nameTh);
                  const itemDescription = pickLocalizedOptional(
                    locale,
                    item.descriptionEn,
                    item.descriptionTh,
                  );

                  return (
                    <li
                      className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                      key={item.id}
                      style={{ animationDelay: `${menuIndex * 80 + itemIndex * 40}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {item.imageUrl?.trim() ? (
                          <MenuItemImage imageUrl={item.imageUrl.trim()} name={itemName} />
                        ) : null}

                        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-900">{itemName}</p>
                              <Badge variant="success">{dict.common.available}</Badge>
                            </div>
                            {itemDescription && (
                              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                {itemDescription}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                            {formatMenuPrice(item.price, currency, locale)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
