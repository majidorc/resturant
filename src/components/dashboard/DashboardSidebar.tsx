"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, MessageSquareWarning, PanelLeft, Settings, X, BellRing } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { useDictionary } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", key: "navOverview" as const, icon: LayoutDashboard },
  { href: "/dashboard/menu", key: "navMenu" as const, icon: Menu },
  { href: "/dashboard/feedback", key: "navFeedback" as const, icon: MessageSquareWarning },
  { href: "/dashboard/waiters", key: "navWaiters" as const, icon: BellRing },
  { href: "/dashboard/settings", key: "navSettings" as const, icon: Settings },
];

type DashboardSidebarProps = {
  restaurantName: string;
  hasProAccess: boolean;
};

function isNavActive(currentPath: string, href: string) {
  return (
    currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href))
  );
}

function SidebarContent({
  restaurantName,
  currentPath,
  hasProAccess,
  onNavigate,
}: {
  restaurantName: string;
  currentPath: string;
  hasProAccess: boolean;
  onNavigate?: () => void;
}) {
  const dict = useDictionary();
  const d = dict.dashboard;

  return (
    <>
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {d.restaurantLabel}
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold text-zinc-900">{restaurantName}</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          if (item.href === "/dashboard/waiters" && !hasProAccess) {
            return null;
          }

          const isActive = isNavActive(currentPath, item.href);
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {d[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="overflow-visible border-t border-slate-200 p-4 space-y-3">
        <LanguageSwitcher className="w-full justify-center" />
        <SignOutButton />
      </div>
    </>
  );
}

export function DashboardSidebar({ restaurantName, hasProAccess }: DashboardSidebarProps) {
  const currentPath = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
      <SidebarContent
        currentPath={currentPath}
        hasProAccess={hasProAccess}
        restaurantName={restaurantName}
      />
    </aside>
  );
}

export function DashboardMobileHeader({ restaurantName, hasProAccess }: DashboardSidebarProps) {
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);
  const dict = useDictionary();
  const d = dict.dashboard;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {d.restaurantLabel}
          </p>
          <p className="truncate text-sm font-semibold text-zinc-900">{restaurantName}</p>
        </div>
        <button
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
          onClick={() => setOpen(true)}
          type="button"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,16rem)] flex-col justify-between border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {d.mobileNav}
                  </p>
                  <p className="truncate text-sm font-semibold text-zinc-900">{restaurantName}</p>
                </div>
                <button
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent
                currentPath={currentPath}
                hasProAccess={hasProAccess}
                onNavigate={() => setOpen(false)}
                restaurantName={restaurantName}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
