"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RestaurantMenuActionsProps = {
  slug: string;
  publicMenuUrl: string;
};

export function RestaurantMenuActions({ slug, publicMenuUrl }: RestaurantMenuActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyMenuLink() {
    await navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={copyMenuLink} type="button" variant="secondary">
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Link
        className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        href={`/menu/${slug}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open Menu
      </Link>
    </div>
  );
}
