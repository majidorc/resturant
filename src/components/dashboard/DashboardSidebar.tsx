"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "M4 6h16M4 12h16M4 18h7" },
  { href: "/dashboard/menu", label: "Menu", icon: "M4 6h16M4 10h16M4 14h10M4 18h6" },
  { href: "/dashboard/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

type DashboardSidebarProps = {
  restaurantName: string;
};

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </svg>
  );
}

function SidebarContent({
  restaurantName,
  currentPath,
  onNavigate,
}: {
  restaurantName: string;
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-slate-100/80 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Restaurant</p>
        <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{restaurantName}</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/dashboard" && currentPath.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <NavIcon path={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100/80 p-4">
        <SignOutButton />
      </div>
    </>
  );
}

export function DashboardSidebar({ restaurantName }: DashboardSidebarProps) {
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100/80 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Dashboard</p>
          <p className="truncate text-sm font-semibold text-slate-900">{restaurantName}</p>
        </div>
        <button
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition-all duration-200 hover:bg-slate-50"
          onClick={() => setOpen(true)}
          type="button"
        >
          <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth={2} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all duration-200"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-2xl transition-all duration-200">
            <SidebarContent
              currentPath={currentPath}
              onNavigate={() => setOpen(false)}
              restaurantName={restaurantName}
            />
          </aside>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-100/80 lg:bg-white">
        <SidebarContent currentPath={currentPath} restaurantName={restaurantName} />
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-100/80 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/dashboard" && currentPath.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all duration-200",
                isActive ? "text-slate-900" : "text-slate-400",
              )}
              href={item.href}
              key={item.href}
            >
              <NavIcon path={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
