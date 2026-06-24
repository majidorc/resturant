"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageLightbox } from "@/components/menu/ImageLightbox";
import { useDictionary } from "@/components/LocaleProvider";
import { pickLocalizedOptional, pickLocalizedText } from "@/lib/i18n";
import { formatMenuPrice, type MenuLanguage } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/dictionary";
import type { JsonTranslationField } from "@/types/translations";

type MenuItemData = {
  id: string;
  name: JsonTranslationField;
  description: JsonTranslationField;
  price: number;
  images: string[];
};

type MenuData = {
  id: string;
  name: JsonTranslationField;
  items: MenuItemData[];
};

type MenuListProps = {
  menus: MenuData[];
  currency: string;
  locale: Locale;
  enabledLanguages: MenuLanguage[];
  dockPadding?: string;
};

function DishImageCarousel({
  images,
  name,
  onImageClick,
}: {
  images: string[];
  name: string;
  onImageClick: (imageUrl: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const validImages = images.map((url) => url.trim()).filter((url) => url && !failedUrls.has(url));

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  function openImage(imageUrl: string) {
    onImageClick(imageUrl);
  }

  if (validImages.length === 0) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-300 md:h-24 md:w-24">
        <UtensilsCrossed className="h-6 w-6" strokeWidth={1.5} />
      </div>
    );
  }

  if (validImages.length === 1) {
    return (
      <button
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 md:h-24 md:w-24"
        onClick={() => openImage(validImages[0])}
        type="button"
      >
        <img
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailedUrls((current) => new Set(current).add(validImages[0]))}
          src={validImages[0]}
        />
      </button>
    );
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    const index = Math.round(container.scrollLeft / width);
    setActiveIndex(Math.min(index, validImages.length - 1));
  }

  function scrollToIndex(index: number) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: "smooth" });
    setActiveIndex(index);
  }

  return (
    <div className="w-20 shrink-0 md:w-24">
      <div
        className="flex h-20 snap-x snap-mandatory overflow-x-auto rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] md:h-24 [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {validImages.map((url, index) => (
          <button
            className="h-20 w-20 shrink-0 snap-center overflow-hidden transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 md:h-24 md:w-24"
            key={`${url}-${index}`}
            onClick={() => openImage(url)}
            type="button"
          >
            <img
              alt={`${name} ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setFailedUrls((current) => new Set(current).add(url))}
              src={url}
            />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-center gap-1">
        {validImages.map((url, index) => (
          <button
            aria-label={`Show image ${index + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              activeIndex === index ? "w-3 bg-amber-500" : "w-1.5 bg-slate-300",
            )}
            key={`dot-${url}`}
            onClick={() => scrollToIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

export function MenuList({
  menus,
  currency,
  locale,
  enabledLanguages,
  dockPadding = "pb-32",
}: MenuListProps) {
  const dict = useDictionary();
  const [activeId, setActiveId] = useState(menus[0]?.id ?? "");
  const [lightbox, setLightbox] = useState<{ imageUrl: string; alt: string } | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const header = document.getElementById("public-menu-header");
    if (!header) return;

    function syncHeaderOffset() {
      if (!header) return;
      document.documentElement.style.setProperty(
        "--public-menu-header-h",
        `${header.offsetHeight}px`,
      );
    }

    syncHeaderOffset();
    const observer = new ResizeObserver(syncHeaderOffset);
    observer.observe(header);
    window.addEventListener("resize", syncHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderOffset);
    };
  }, []);

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
      <div className={`px-4 py-16 text-center ${dockPadding}`}>
        <p className="text-sm text-slate-500">{dict.publicMenu.noItems}</p>
      </div>
    );
  }

  return (
    <>
      <div className={dockPadding}>
        <nav className="sticky top-[var(--public-menu-header-h,0px)] z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
          <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {menus.map((menu) => (
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeId === menu.id
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                key={menu.id}
                onClick={() => scrollToCategory(menu.id)}
                type="button"
              >
                {pickLocalizedText(locale, menu.name, enabledLanguages)}
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-6 px-4 py-6">
          {menus.map((menu, menuIndex) => {
            const menuName = pickLocalizedText(locale, menu.name, enabledLanguages);

            return (
              <section
                className="scroll-mt-[calc(var(--public-menu-header-h,0px)+4.5rem)]"
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
                    const itemName = pickLocalizedText(locale, item.name, enabledLanguages);
                    const itemDescription = pickLocalizedOptional(
                      locale,
                      item.description,
                      enabledLanguages,
                    );

                    return (
                      <li
                        className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                        key={item.id}
                        style={{ animationDelay: `${menuIndex * 80 + itemIndex * 40}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <DishImageCarousel
                            images={item.images}
                            name={itemName}
                            onImageClick={(imageUrl) =>
                              setLightbox({ imageUrl, alt: itemName })
                            }
                          />

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
                            <span className="shrink-0 text-base font-bold tabular-nums text-amber-600">
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

      {lightbox && (
        <ImageLightbox
          alt={lightbox.alt}
          imageUrl={lightbox.imageUrl}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
