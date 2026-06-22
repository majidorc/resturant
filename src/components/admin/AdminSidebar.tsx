"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/feedback", label: "Feedback" },
];

function SidebarContent({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/80 to-white px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">Platform Control</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Super Admin</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/admin" && currentPath.startsWith(item.href));

          return (
            <Link
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
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

export function AdminSidebar() {
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-indigo-100/80 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Super Admin</p>
          <p className="text-sm font-semibold text-slate-900">Platform Console</p>
        </div>
        <button
          aria-label="Open admin navigation"
          className="rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm transition-all duration-200 hover:bg-indigo-50"
          onClick={() => setOpen(true)}
          type="button"
        >
          <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth={2} />
          </svg>
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
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-2xl">
            <SidebarContent currentPath={currentPath} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-indigo-100/80 lg:bg-white">
        <SidebarContent currentPath={currentPath} />
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-indigo-100/80 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/admin" && currentPath.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all duration-200",
                isActive ? "text-indigo-600" : "text-slate-400",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
