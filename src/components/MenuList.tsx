"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

type MenuItemData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};

type MenuData = {
  id: string;
  name: string;
  items: MenuItemData[];
};

type MenuListProps = {
  menus: MenuData[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function MenuList({ menus }: MenuListProps) {
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
        <p className="text-sm text-slate-500">No menu items available yet.</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <nav className="sticky top-0 z-10 border-b border-slate-100/80 bg-white/90 px-4 py-3 backdrop-blur-md">
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
              {menu.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="space-y-6 px-4 py-6">
        {menus.map((menu, menuIndex) => (
          <section
            className="scroll-mt-28"
            id={menu.id}
            key={menu.id}
            ref={(node) => {
              sectionRefs.current[menu.id] = node;
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{menu.name}</h2>
              <Badge>{menu.items.length} items</Badge>
            </div>

            <ul className="space-y-3">
              {menu.items.map((item, itemIndex) => (
                <li
                  className="animate-fade-in-up rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md"
                  key={item.id}
                  style={{ animationDelay: `${menuIndex * 80 + itemIndex * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <Badge variant="success">Available</Badge>
                      </div>
                      {item.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
