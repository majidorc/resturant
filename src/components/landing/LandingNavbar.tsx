"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link className="text-lg font-semibold tracking-tight text-slate-900 transition-colors duration-200 hover:text-slate-600" href="/">
          MenuHub
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              className="text-sm font-medium text-slate-600 transition-all duration-200 ease-in-out hover:text-slate-900"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button type="button" variant="ghost">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md" type="button">
              Get Started Free
            </Button>
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-xl border border-slate-200/80 p-2.5 text-slate-700 transition-all duration-200 ease-in-out hover:bg-slate-50 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100/80 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out hover:bg-slate-50"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link className="mt-2" href="/login" onClick={() => setOpen(false)}>
              <Button className="w-full" type="button" variant="secondary">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full" type="button">
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
