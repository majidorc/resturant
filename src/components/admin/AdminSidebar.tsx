"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/feedback", label: "Global Feedback" },
];

export function AdminSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-zinc-200 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Platform</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900">Super Admin</h2>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/admin" && currentPath.startsWith(item.href));

          return (
            <Link
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
