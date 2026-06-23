"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, Store, Users, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { useDictionary } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", key: "navOverview" as const, icon: LayoutDashboard },
  { href: "/admin/restaurants", key: "navRestaurants" as const, icon: Store },
  { href: "/admin/leads", key: "navLeads" as const, icon: Users },
];

function isNavActive(currentPath: string, href: string) {
  return (
    currentPath === href || (href !== "/admin" && currentPath.startsWith(href))
  );
}

function SidebarContent({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: () => void;
}) {
  const dict = useDictionary();
  const a = dict.admin;

  return (
    <>
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {a.platformLabel}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900">{a.superAdmin}</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
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
              {a[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-200 p-4">
        <LanguageSwitcher className="w-full justify-center" />
        <SignOutButton />
      </div>
    </>
  );
}

export function AdminSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
      <SidebarContent currentPath={currentPath} />
    </aside>
  );
}

export function AdminMobileHeader() {
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);
  const dict = useDictionary();
  const a = dict.admin;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {a.superAdmin}
          </p>
          <p className="truncate text-sm font-semibold text-zinc-900">{a.mobileConsole}</p>
        </div>
        <button
          aria-label="Open admin navigation"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,16rem)] flex-col justify-between border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {a.mobileNav}
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">{a.menuHubAdmin}</p>
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
                onNavigate={() => setOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
